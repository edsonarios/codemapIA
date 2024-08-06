import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import simpleGit from 'simple-git'
import { Repository } from '@/app/page'
import { processRepository } from '../processRepository/processRepository'
import { exec } from 'child_process'
import axios from 'axios'
import extract from 'extract-zip'

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

const runCommand = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout || stderr)
      }
    })
  })
}

const git = simpleGit()
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    const repoName = url.replace('https://github.com/', '')
    const nameUser = repoName.split('/')[0]
    const repositoryName = repoName.split('/')[1]
    const cloneDir = path.resolve(folderPath, 'clonedRepositories', nameUser)
    const zipPath = path.join(
      folderPath,
      'clonedRepositories',
      `${repoName}.zip`,
    )

    const data = fs.readFileSync(filePath, 'utf8')
    const repositories = JSON.parse(data) as Repository[]
    const existingRepo = repositories.find((repo) => repo.url === url)
    if (existingRepo) {
      return NextResponse.json({ url: repoName })
    } else {
      fs.mkdirSync(path.join(cloneDir), {
        recursive: true,
      })
      if (!fs.existsSync(path.join(cloneDir))) {
        console.log('Creating folder:', repoName)
        fs.mkdirSync(path.join(cloneDir), {
          recursive: true,
        })
      }
      if (fs.existsSync(cloneDir)) {
        console.log('zipPath:', zipPath)
        console.log('cloneDir:', cloneDir)
        // console.log('Cloning repository:', url)
        // await git.clone(url, cloneDir)
        // await runCommand(`git clone ${url} ${cloneDir}`)
        const downloadUrl = `https://github.com/${repoName}/archive/refs/heads/main.zip`
        console.log('downloadUrl:', downloadUrl)
        const response = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
        })
        console.log('response:', response)
        fs.writeFileSync(zipPath, response.data)

        // Extraer el archivo zip
        await extract(zipPath, { dir: cloneDir })

        // Eliminar el archivo zip
        fs.unlinkSync(zipPath)
      } else {
        // console.log('Repository already cloned:', cloneDir)
      }
      await processRepository(`${repoName}-main`)
      fs.rmdirSync(path.join(cloneDir, `${repositoryName}-main`), {
        recursive: true,
      })

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
    console.log(error)
    if (error?.message.includes('Repository not found')) {
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: 404 },
      )
    }
    return NextResponse.json(
      { error: 'Error writing file', message: error.message },
      { status: 500 },
    )
  }
}
