import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { paramViewPageName } from '@/components/utils/constants'
import { routePath } from '../utils'

function madePath(repoName: string) {
  return path.resolve(
    `${routePath}/processedRepositories/${repoName}/nodesAndEdges.json`,
  )
}

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

    const data = fs.readFileSync(madePath(repoName), 'utf8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json({ error: 'Error reading file' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { body } = await req.json()
    const { searchParams } = new URL(req.url)
    const repoName = searchParams.get(paramViewPageName)
    if (!repoName) {
      return NextResponse.json(
        { error: 'Repository name not found' },
        { status: 400 },
      )
    }

    fs.writeFileSync(madePath(repoName), JSON.stringify(body, null, 2))
    return NextResponse.json({ response: 'Saved successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Error writing file' }, { status: 500 })
  }
}
