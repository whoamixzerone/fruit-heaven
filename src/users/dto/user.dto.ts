import { OmitType } from '@nestjs/mapped-types';
import { Users } from '../entities/user.entity';

export class UserDto extends OmitType(Users, [
  'password',
  'hashPassword',
] as const) {}
