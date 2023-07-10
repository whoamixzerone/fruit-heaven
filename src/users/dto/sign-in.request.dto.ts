import { PickType } from '@nestjs/mapped-types';
import { Users } from '../entities/user.entity';

export class SignInRequestDto extends PickType(Users, [
  'email',
  'password',
] as const) {}