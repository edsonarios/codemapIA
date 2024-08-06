import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { paramViewPageName } from '@/components/utils/constants'
import { routePath } from '../utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const repoName = searchParams.get(paramViewPageName)
    if (!repoName) {
      return NextResponse.json(
        { error: 'Repository name not found' },
        { status: 400 },
      )
    }
    // const filePath = path.resolve(
    //   `src/app/api/data/processedRepositories/${repoName}/fileDetails.json`,
    // )
    const filePath = path.resolve(
      `${routePath}/processedRepositories/${repoName}/fileDetails.json`,
    )
    const data = fs.readFileSync(filePath, 'utf8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json({ error: 'Error reading file' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, detail } = await req.json()
    const { searchParams } = new URL(req.url)
    const repoName = searchParams.get(paramViewPageName)
    if (!repoName) {
      return NextResponse.json(
        { error: 'Repository name not found' },
        { status: 400 },
      )
    }
    // const filePath = path.resolve(
    //   `src/app/api/data/processedRepositories/${repoName}/fileDetails.json`,
    // )
    const filePath = path.resolve(
      `${routePath}/processedRepositories/${repoName}/fileDetails.json`,
    )
    const data = fs.readFileSync(filePath, 'utf8')
    const jsonData = JSON.parse(data)
    jsonData[key] = detail
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error writing file' }, { status: 500 })
  }
}
