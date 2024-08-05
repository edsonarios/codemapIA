import { openai } from '@ai-sdk/openai'
import { streamText, StreamData } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()
  const data = new StreamData()
  const result = await streamText({
    // model: openai('gpt-4-turbo'),
    model: openai('gpt-3.5-turbo-0125'),
    messages,
    onFinish() {
      data.close()
    },
  })

  return result.toDataStreamResponse({ data })
}
