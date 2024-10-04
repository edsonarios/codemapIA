import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
// import { UpdateUserDto } from './dto/update-user.dto'
import { DBService } from '../db/db.service'
import * as bcrypt from 'bcrypt'
import { VercelLogger } from '../../common/nestConfig/logger'

@Injectable()
export class UsersService {
  private readonly logger = new VercelLogger(UsersService.name)
  constructor(private readonly dbService: DBService) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log('create')
    const { provider } = createUserDto
    try {
      switch (provider) {
        case 'credentials': {
          const userExist = await this.dbService.getUserByEmailAndProvider(
            createUserDto.email,
            provider,
          )
          if (userExist) {
            this.logger.error('email already registered')
            throw new BadRequestException('Email already registered')
          }
          const salt = await bcrypt.genSalt()
          const hashedPassword = await bcrypt.hash(createUserDto.password, salt)
          this.dbService.createUser({
            ...createUserDto,
            password: hashedPassword,
          })
          return { message: 'User registered successfully' }
        }
        default: {
          return this.dbService.createUser({
            ...createUserDto,
          })
        }
      }
    } catch (error) {
      this.logger.error('create', error)
      throw error
    }
  }

  findOne(id: string) {
    this.logger.log('findOne')
    try {
      return this.dbService.getUserById(id.toString())
    } catch (error) {
      throw error
    }
  }

  // findAll() {
  //   return `This action returns all users`
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`
  // }
}
