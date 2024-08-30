import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { CreateLoginDto } from './dto/create-login.dto'
import { DBService } from '../db/db.service'
import { f } from '../../common/nestConfig/logger'
import * as bcrypt from 'bcrypt'

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name)
  constructor(private readonly dbService: DBService) {}

  async login(createLoginDto: CreateLoginDto) {
    this.logger.log('login')
    const { email, password } = createLoginDto
    try {
      const user = await this.dbService.getUserByEmailForCredentials(email)
      if (user) {
        this.logger.debug('user found')
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
          this.logger.error('incorrect password')
          throw new BadRequestException('Incorrect password')
        }
        return user
      } else {
        this.logger.error('email not found')
        throw new BadRequestException('Email not found')
      }
    } catch (error) {
      this.logger.error(`login:_ ${f(error)}`)
      throw error
    }
  }
}
