import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import simpleGit from 'simple-git'
import { Repository } from '@/app/page'
import { processRepository } from '../processRepository/processRepository'

const folderPath = 'src/app/api/data/'
const filePath = path.resolve(`${folderPath}repositories.json`)

const saveRepos = (repos: Repository[]) => {
  fs.writeFileSync(filePath, JSON.stringify(repos, null, 2), 'utf8')
}

export async function GET() {
  try {
    const data = fs.readFileSync(filePath, 'utf8')
    return NextResponse.json(JSON.parse(data) as Repository[])
  } catch (error) {
    return NextResponse.json({ error: 'Error reading file' }, { status: 500 })
  }
}

const git = simpleGit()
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    const repoName = url.replace('https://github.com/', '')
    const cloneDir = path.join(folderPath, 'clonedRepositories', repoName)

    const data = fs.readFileSync(filePath, 'utf8')
    const repositories = JSON.parse(data) as Repository[]
    const existingRepo = repositories.find((repo) => repo.url === url)
    if (existingRepo) {
      return NextResponse.json({ url: repoName })
    } else {
      if (!fs.existsSync(cloneDir)) {
        console.log('Cloning repository:', url)
        await git.clone(url, cloneDir)
      } else {
        console.log('Repository already cloned:', cloneDir)
      }
      await processRepository(repoName)
      fs.rmdirSync(cloneDir, { recursive: true })

      const newRepo: Repository = {
        name: url.split('/').pop() as string,
        url,
        description: '',
      }
      repositories.push(newRepo)
      saveRepos(repositories)
      return NextResponse.json({ url: repoName })
    }
  } catch (error: any) {
    // console.log(error)
    if (error?.message.includes('Repository not found')) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 },
      )
    }
    return NextResponse.json({ error: 'Error writing file' }, { status: 500 })
  }
}
