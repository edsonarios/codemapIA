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

  // Show all logs
  fatal(message: string) {
    if (message === 'flushLogs') {
      this.flushLogs()
    }
  }

  private storeLog(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ) {
    if (ignoreContext.includes(context)) return
    const messageToLog = `${level} ${context ? `[${context}]` : ''} ${message}`
    const logEntry = { message: messageToLog }
    if (trace) {
      logEntry['trace'] = trace
    }
    this.logs.push(logEntry)
    if (context === 'NestApplication') {
      this.flushLogs()
    }
  }

  flushLogs() {
    const parseLogs: any[] = []
    for (let index = 0; index < this.logs.length; index++) {
      const currentLog = this.logs[index]
      const messageAndObject = (currentLog.message as string).split(':_')
      if (messageAndObject.length > 1) {
        parseLogs.push(
          f({
            level: currentLog.level,
            message: messageAndObject[0],
            context: currentLog.context,
            trace: currentLog.trace,
          }),
        )
        for (let indexJ = 1; indexJ < messageAndObject.length; indexJ++) {
          parseLogs.push(messageAndObject[indexJ])
        }
      } else {
        parseLogs.push(currentLog)
      }
    }
    const toShowMessages = parseLogs.map((log) => f(log)).join(' ')
    this.logger.info(toShowMessages)
    this.clearLogs()
  }

  private clearLogs() {
    this.logs = []
  }
}

export function f(...messages: any[]) {
  // const { STAGE } = process.env
  return messages
    .map((message) => {
      return typeof message === 'object'
        ? inspect(message, { depth: null, colors: true })
        : message
      // if (STAGE === 'local') {
      //   return typeof message === 'object'
      //     ? inspect(message, { depth: null, colors: true })
      //     : message
      // } else {
      //   return typeof message === 'object' ? JSON.stringify(message) : message
      // }
    })
    .join(' ')
}

const ignoreContext = ['InstanceLoader', 'RouterExplorer', 'RoutesResolver']
