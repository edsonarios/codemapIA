import { NextResponse, NextRequest } from 'next/server'
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
    const filePath = path.resolve(
      `${routePath}/processedRepositories/${repoName}/contentFiles.json`,
    )
    const data = fs.readFileSync(filePath, 'utf8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json({ error: 'Error reading file' }, { status: 500 })
  }
}
