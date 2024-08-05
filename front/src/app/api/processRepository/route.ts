import { NextRequest, NextResponse } from 'next/server'
import simpleGit from 'simple-git'
import fs from 'fs'
import path from 'path'
import { processRepository } from './processRepository'

const filePath = path.resolve('src/app/api/data')
const git = simpleGit()

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  const repoName = url.replace('https://github.com/', '')
  const cloneDir = path.join(filePath, 'clonedRepositories', repoName)
  console.log('cloneDir:', cloneDir)
  try {
    // Eliminar el directorio si ya existe
    if (!fs.existsSync(cloneDir)) {
      console.log('Cloning repository:', url)
      await git.clone(url, cloneDir)
      // console.log('Removing existing directory:', cloneDir)
      // fs.rmdirSync(cloneDir, { recursive: true })
    } else {
      console.log('Repository already cloned:', cloneDir)
    }
    await processRepository(repoName)

    // Clonar el repositorio

    return NextResponse.json({ message: 'Repository cloned successfully' })
  } catch (error) {
    console.error('Error cloning repository:', error)
    return NextResponse.json(
      { error: 'Error cloning repository' },
      { status: 500 },
    )
  }
}
