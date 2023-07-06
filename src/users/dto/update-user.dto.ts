import { PartialType } from '@nestjs/mapped-types';
import { JoinRequestDto } from './join.request.dto';

export class UpdateUserDto extends PartialType(JoinRequestDto) {}
