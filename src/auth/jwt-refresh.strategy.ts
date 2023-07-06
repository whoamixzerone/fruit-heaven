import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { UserDto } from '../users/dto/user.dto';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: {
      userId: number;
      tokenType: string;
    },
  ): Promise<UserDto> {
    const { userId, tokenType } = payload;
    if (tokenType !== 'refresh_token') {
      throw new UnauthorizedException('refresh 토큰이 아닙니다.');
    }

    const reqToken: string | undefined = this.extractTokenFromHeader(req);
    if (!reqToken) {
      throw new UnauthorizedException('토큰이 존재하지 않습니다.');
    }

    const redisToken = await this.cacheManager.get<string>(
      `refresh_token:${userId}`,
    );
    if (reqToken !== redisToken) {
      throw new UnauthorizedException('토큰이 일치하지 않습니다.');
    }

    const user: UserDto = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('올바른 사용자가 아닙니다.');
    }

    return user;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
