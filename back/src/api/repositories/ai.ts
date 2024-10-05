import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { VercelLogger } from '../../common/nestConfig/logger'

const logger = new VercelLogger('getDescriptionByIA')
export async function getDescriptionByIA(
  url: string,
  structure: Record<string, string[]>,
  contentFiles: Record<string, string>,
): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY is not present')
    return ''
  }
  try {
    const { text } = await generateText({
      // model: openai('gpt-4-turbo'),
      model: openai('gpt-3.5-turbo-0125'),
      prompt: `Tengo un proyecto completo de github la url es ${url} y la estructura es la siguiente:
    ${structure}
    Y el contenido de los archivos es el siguiente:
    ${contentFiles}
    Usando el nombre del proyecto que viene desde la url, usando la estructura del proyecto y el contenido de estos archivos, quiero una breve descripcion del proyecto, cual es su proposito y para que serviria. Maximo 300 caracteres Ejemplo:
    Este es un proyecto que tiene la funcion de hacer un analisis de sentimientos de un texto utilizando como principal tecnologia typescript y react.`,
    })
    return text
  } catch (error) {
    logger.error(`error getDescriptionByIA:_ ${error}`)
    return ''
  }
}
