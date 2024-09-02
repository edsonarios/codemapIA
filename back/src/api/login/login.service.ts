import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { CreateLoginDto } from './dto/create-login.dto'
import { DBService } from '../db/db.service'
import { f } from '../../common/nestConfig/logger'
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from '../users/dto/create-user.dto'

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name)
  constructor(private readonly dbService: DBService) {}

  async login(createLoginDto: CreateLoginDto) {
    this.logger.log('login')
    const { email, password, provider } = createLoginDto
    try {
      const user = await this.dbService.getUserByEmailAndProvider(
        email,
        provider,
      )
      if (user) {
        this.logger.debug('user found')
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
          this.logger.error('incorrect password')
          throw new BadRequestException('Incorrect password')
        }
        return user
      } else {
        this.logger.error('email not registered')
        throw new BadRequestException('Email not registered')
      }
    } catch (error) {
      this.logger.error(`login:_ ${f(error)}`)
      throw error
    }
  }

  async loginByProvider(loginProviderDto: CreateUserDto) {
    this.logger.log('loginByProvider')
    const { name, email, provider, image } = loginProviderDto
    try {
      const user = await this.dbService.getUserByEmailAndProvider(
        email,
        provider,
      )
      if (!user) {
        this.logger.warn('creating new user')
        const newUser = await this.dbService.createUser({
          ...loginProviderDto,
        })
        return newUser
      }
      if (name !== user.name || image !== user.image) {
        this.logger.warn('updating user')
        return await this.dbService.updateUser(user, loginProviderDto)
      }
      return user
    } catch (error) {
      this.logger.error(`loginByProvider:_ ${f(error)}`)
      throw error
    }
  }
}
