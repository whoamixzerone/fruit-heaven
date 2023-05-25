import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/join')
  async join(@Body() createUserDto: CreateUserDto): Promise<boolean> {
    return this.authService.join(createUserDto);
  }

  @Post('/login')
  logIn(@Body() customer: any) {
    // return this.authService.logIn();
    return '';
  }

  @Post('/logout')
  logOut() {
    // return this.authService.logOut();
    return '';
  }
}
