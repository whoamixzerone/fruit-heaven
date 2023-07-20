import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UsersRole } from '../../users/user-role.enum';
import { JwtAccessAuthGuard } from '../../auth/jwt-access-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';
export const Roles = (roles: UsersRole[]) => SetMetadata(ROLES_KEY, roles);

export function Authorization(roles: UsersRole[]) {
  return applyDecorators(
    Roles(roles),
    UseGuards(JwtAccessAuthGuard),
    UseGuards(RolesGuard),
  );
}
