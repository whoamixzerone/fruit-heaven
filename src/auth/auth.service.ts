import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Users } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { UserDto } from '../users/dto/user.dto';
import { Algorithm, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, pwd: string): Promise<UserDto> {
    const user: Users = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('존재하지 않는 회원입니다.');
    }

    const isPasswordCompare = await bcrypt.compare(pwd, user.password);
    if (!isPasswordCompare) {
      throw new UnauthorizedException('아이디 혹은 비밀번호를 확인해주세요.');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async generateAccessToken(user: UserDto): Promise<string> {
    const payload = {
      userId: user.id,
      username: user.name,
      role: user.role,
      tokenType: 'access_token',
    };

    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(user: UserDto): Promise<string> {
    const payload = {
      userId: user.id,
      tokenType: 'refresh_token',
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRESIN'),
      algorithm: this.configService.get<Algorithm>('JWT_ALGORITHM_TYPE'),
    });
  }

  JwtTokenErrorHandle(info: any): void {
    const errorMsg = info?.message ?? undefined;

    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('만료된 토큰입니다.');
    } else if (info instanceof JsonWebTokenError) {
      if (errorMsg === 'invalid token') {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      } else if (errorMsg === 'jwt malformed') {
        throw new UnauthorizedException('잘못된 구성 요소의 토큰입니다.');
      } else if (errorMsg === 'invalid signature') {
        throw new UnauthorizedException('유효하지 않은 서명입니다.');
      }
    } else if (errorMsg === 'No auth token') {
      throw new UnauthorizedException('토큰이 존재하지 않습니다.');
    }
  }
}
