import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { UserDto } from '../users/dto/user.dto';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: {
    userId: number;
    username: string;
    tokenType: string;
  }): Promise<UserDto> {
    const { userId, username, tokenType } = payload;

    const user: UserDto = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('올바른 사용자가 아닙니다.');
    }

    return user;
  }
}
