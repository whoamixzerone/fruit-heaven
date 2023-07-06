import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { UserDto } from '../users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  async refreshToken(@User() user: UserDto): Promise<{ access_token: string }> {
    const accessToken: string = await this.authService.generateAccessToken(
      user,
    );

    return { access_token: accessToken };
  }
}
