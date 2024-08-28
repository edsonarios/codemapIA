import { Injectable, Scope, LoggerService, ConsoleLogger } from '@nestjs/common'
import * as winston from 'winston'
import * as Transport from 'winston-transport'
import { inspect } from 'util'

@Injectable({ scope: Scope.DEFAULT })
export class CustomLogger extends ConsoleLogger implements LoggerService {
  private readonly logger: winston.Logger
  private readonly isLocal: boolean
  logs: any[] = []

  constructor() {
    super()
    this.isLocal = process.env.STAGE === 'local'
    if (!this.isLocal) {
      const transports: Transport[] = [
        new winston.transports.Console({
          format: winston.format.printf(
            // ({ level, message, context, timestamp }) => {
            ({ message }) => {
              return `[Nest] ${message}`
            },
          ),
        }),
      ]

      this.logger = winston.createLogger({
        level: process.env.LEVEL_DEBUG || 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.splat(),
          winston.format.json(),
        ),
        defaultMeta: { service: 'user-service' },
        transports,
      })
    }
  }

  log(message: string, context?: string) {
    const contextMessage = context || this.context || 'App'
    if (this.isLocal) {
      super.log(message, context)
    } else {
      this.madeLog('LOG', message, contextMessage)
    }
  }

  error(message: string, trace: string, context?: string) {
    const contextMessage = context || this.context || 'App'
    if (this.isLocal) {
      super.error(message, trace, context)
    } else {
      this.madeLog('ERROR', message, contextMessage)
    }
  }

  warn(message: string, context?: string) {
    const contextMessage = context || this.context || 'App'
    if (this.isLocal) {
      super.warn(message, context)
    } else {
      this.madeLog('WARN', message, contextMessage)
    }
  }

  debug(message: string, context?: string) {
    const contextMessage = context || this.context || 'App'
    if (this.isLocal) {
      super.debug(message, context)
    } else {
      this.madeLog('DEBUG', message, contextMessage)
    }
  }

  verbose(message: string, context?: string) {
    const contextMessage = context || this.context || 'App'
    if (this.isLocal) {
      super.verbose(message, context)
    } else {
      this.madeLog('VERBOSE', message, contextMessage)
    }
  }

  private madeLog(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ) {
    const messageAndObject = message.split(':_')
    if (messageAndObject.length > 1) {
      let messageToLog = `${level} [${context}] ${messageAndObject[0]}`
      const logEntry: any = { message: messageToLog }
      if (trace) {
        messageToLog = `${messageToLog} ${trace}`
      }
      this.logger.info(logEntry)

      for (let index = 1; index < messageAndObject.length; index++) {
        this.logger.info(messageAndObject[index])
      }
    } else {
      this.logger.info(`${level} [${context}] ${message}`)
    }
  }
}

export function f(...messages: any[]) {
  const { STAGE } = process.env
  return messages
    .map((message) => {
      return typeof message === 'object'
        ? inspect(message, {
            depth: null,
            colors: STAGE === 'local' ? true : false,
          })
        : message
    })
    .join(' ')
}
