import { inspect } from 'util'

export function f(...messages: any[]) {
  const { STAGE } = process.env
  return messages
    .map((message) => {
      if (STAGE === 'local') {
        return typeof message === 'object'
          ? inspect(message, { depth: null, colors: true })
          : message
      } else {
        return typeof message === 'object' ? JSON.stringify(message) : message
      }
    })
    .join(' ')
}
