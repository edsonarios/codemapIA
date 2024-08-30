import { Injectable, Logger } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
// import { UpdateUserDto } from './dto/update-user.dto'
import { DBService } from '../db/db.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)
  constructor(private readonly dbService: DBService) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log('create')
    const { provider } = createUserDto
    try {
      switch (provider) {
        case 'credentials': {
          const salt = await bcrypt.genSalt()
          const hashedPassword = await bcrypt.hash(createUserDto.password, salt)
          return this.dbService.createUser({
            ...createUserDto,
            password: hashedPassword,
          })
        }
        default: {
          return this.dbService.createUser({
            ...createUserDto,
          })
        }
      }
    } catch (error) {
      this.logger.error(`create:_ ${error}`)
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`
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
