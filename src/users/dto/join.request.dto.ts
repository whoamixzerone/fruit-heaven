import { PickType } from '@nestjs/mapped-types';
import { Users } from '../entities/user.entity';

export class JoinRequestDto extends PickType(Users, [
  'email',
  'password',
  'name',
  'cellPhone',
] as const) {}
