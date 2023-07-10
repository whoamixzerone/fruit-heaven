import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard('jwt-access-token') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (info) {
      this.authService.jwtTokenErrorHandle(info);
    }

    return super.handleRequest(err, user, info, context);
  }
}
