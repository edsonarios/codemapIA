import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import simpleGit from 'simple-git'
import { Repository } from '@/app/page'
import { processRepository } from '../processRepository/processRepository'
import { exec } from 'child_process'
import axios from 'axios'
import extract from 'extract-zip'
import { formatRepositoryName, routePath } from '../utils'

// const folderPath = 'src/app/api/data/'
// const folderPath = '/tmp/'
const folderPath = routePath

// const filePath = path.resolve(`${folderPath}repositories.json`)
// const filePath = path.resolve('src/app/api/data/repositories.json')

// const filePath = path.resolve('/tmp/repositories.json')
const filePath = `${routePath}/repositories.json`

const saveRepos = (repos: Repository[]) => {
  fs.writeFileSync(filePath, JSON.stringify(repos, null, 2), 'utf8')
}

const ensureFileExists = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), 'utf8')
  }
}

export async function GET() {
  try {
    ensureFileExists(filePath)
    const data = fs.readFileSync(filePath, 'utf8')
    return NextResponse.json(JSON.parse(data) as Repository[])
  } catch (error) {
    return NextResponse.json({ error: 'Error reading file' }, { status: 500 })
  }
}

// const runCommand = (command: string) => {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(error)
//       } else {
//         resolve(stdout || stderr)
//       }
//     })
//   })
// }

// const git = simpleGit()
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    const repoName = url.replace('https://github.com/', '')
    const nameUser = repoName.split('/')[0]
    const repositoryName = repoName.split('/')[1]
    const cloneDir = path.resolve(folderPath, 'clonedRepositories', nameUser)
    const zipPath = path.resolve(
      folderPath,
      'clonedRepositories',
      `${repoName}.zip`,
    )

    console.log('cloneDir:', cloneDir)
    console.log('zipPath:', zipPath)

    // const lsOutput = await runCommand('ls -la /tmp')
    // console.log('lsOutput:', lsOutput)

    // Intentar crear un directorio de prueba para verificar permisos
    // const testDir = path.join('/tmp/', 'test-permissions')
    // try {
    //   fs.mkdirSync(testDir, { recursive: true })
    //   fs.rmdirSync(testDir) // Eliminar el directorio de prueba después de la verificación
    // } catch (error: any) {
    //   console.log('Error creating test directory:', error)
    //   return NextResponse.json(
    //     {
    //       error: 'Insufficient permissions to create directory',
    //       message: error.message,
    //       lsOutput,
    //     },
    //     { status: 500 },
    //   )
    // }

    try {
      if (!fs.existsSync(cloneDir)) {
        fs.mkdirSync(cloneDir, { recursive: true })
      }
    } catch (error: any) {
      console.log('Error creating directory:', error)
      return NextResponse.json(
        {
          error: 'Error creating directory',
          message: error.message,
        },
        { status: 500 },
      )
    }

    const data = fs.readFileSync(filePath, 'utf8')
    const repositories = JSON.parse(data) as Repository[]
    const existingRepo = repositories.find((repo) => repo.url === url)
    if (existingRepo) {
      return NextResponse.json({ url: repoName })
    } else {
      if (fs.existsSync(cloneDir)) {
        console.log('zipPath:', zipPath)
        console.log('cloneDir:', cloneDir)

        const downloadUrl = `https://github.com/${repoName}/archive/refs/heads/main.zip`
        console.log('downloadUrl:', downloadUrl)
        const response = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
        })
        console.log('response:', response)
        fs.writeFileSync(zipPath, response.data)

        await extract(zipPath, { dir: cloneDir })

        fs.unlinkSync(zipPath)
      }

      await processRepository(`${repoName}-main`)
      fs.rmdirSync(path.resolve(cloneDir, `${repositoryName}-main`), {
        recursive: true,
      })

      const newRepo: Repository = {
        name: formatRepositoryName(repositoryName),
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
