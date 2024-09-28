import { openai } from '@ai-sdk/openai'
import { streamText, StreamData } from 'ai'
import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, apiKey, modelIA } = await req.json()
  const key = apiKey || process.env.OPENAI_API_KEY
  if (!key) {
    return NextResponse.json(
      {
        error:
          'API Key is required. You can find your API key at https://platform.openai.com/account/api-keys.',
      },
      { status: 400 },
    )
  }
  process.env.OPENAI_API_KEY = key
  try {
    const data = new StreamData()
    const result = await streamText({
      // model: openai('gpt-4-turbo'),
      model: openai(modelIA),
      messages,
      onFinish() {
        data.close()
      },
    })
    return result.toDataStreamResponse({ data })
  } catch (error: any) {
    // console.log(error.message)
    if (error.message.includes('OpenAI API key is missing')) {
      return NextResponse.json(
        { error: 'An valid API Key is required' },
        { status: 400 },
      )
    }
    if (error.message.includes('Incorrect API key provided')) {
      return NextResponse.json(
        {
          error:
            'Incorrect API key provided. You can find your API key at https://platform.openai.com/account/api-keys.',
        },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    process.env.OPENAI_API_KEY = ''
  }
}
