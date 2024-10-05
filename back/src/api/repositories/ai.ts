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
      prompt: getExplainPrompt('EN', url, structure, contentFiles),
    })
    return text + '\nDescription Powered by OpenAI'
  } catch (error) {
    logger.error('getDescriptionByIA', error)
    return ''
  }
}

export function getExplainPrompt(
  language: string,
  url: string,
  structure: Record<string, string[]>,
  contentFiles: Record<string, string>,
) {
  if (language === 'ES') {
    return `Tengo un proyecto completo de github la url es ${url} y la estructura es la siguiente:
    ${structure}
    Y el contenido de los archivos es el siguiente:
    ${contentFiles}
    Usando el nombre del proyecto que viene desde la url, usando la estructura del proyecto y el contenido de estos archivos, quiero una breve descripcion del proyecto, cual es su proposito y para que serviria. Maximo 300 caracteres Ejemplo:
    Este es un proyecto que tiene la funcion de hacer un analisis de sentimientos de un texto utilizando como principal tecnologia typescript y react.`
  }
  return `I have a complete github project the url is ${url} and the structure is as follows:
  ${structure}
  And the content of the files is as follows:
  ${contentFiles}
  Using the name of the project that comes from the url, using the structure of the project and the content of these files, I want a brief description of the project, what is its purpose and what it would be used for. Maximum 300 characters Example:
  This is a project that has the function of doing a sentiment analysis of a text using as main technology typescript and react.`
}
