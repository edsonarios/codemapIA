import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { routePath } from '../utils'
import { DBRepository } from '@/db/repositories/db.repository'

const filePath = path.join(routePath, 'repositories.json')

export async function GET() {
  console.log('GET')

  try {
    console.log('GET2')
    const db = new DBRepository()
    console.log('GET3')
    await db.initializeClient()

    console.log('GET4')
    const data = await db.getRepositories()
    console.log(data)
    return NextResponse.json({ message: 'Hello World' })
  } catch (error) {
    return NextResponse.json({ error: 'Error reading file' }, { status: 500 })
  }
}

// export async function POST(req: NextRequest) {

// }
