import { Controller, Post, Body, Patch } from '@nestjs/common'
import { LoginService } from './login.service'
import { CreateLoginDto } from './dto/create-login.dto'
import { VercelLogger } from '../../common/nestConfig/logger'
import { CreateUserDto } from '../users/dto/create-user.dto'

@Controller('login')
export class LoginController {
  private readonly logger = new VercelLogger(LoginController.name)
  constructor(private readonly loginService: LoginService) {}

  @Post()
  login(@Body() createLoginDto: CreateLoginDto) {
    this.logger.log('login', createLoginDto)
    return this.loginService.login(createLoginDto)
  }

  @Patch()
  loginByProvider(@Body() loginProviderDto: CreateUserDto) {
    this.logger.log('loginByProvider', loginProviderDto)
    return this.loginService.loginByProvider(loginProviderDto)
  }
}
