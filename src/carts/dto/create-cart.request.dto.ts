import { PickType } from '@nestjs/mapped-types';
import { Carts } from '../entities/cart.entity';

export class CreateCartRequestDto extends PickType(Carts, [
  'ProductId',
  'quantity',
] as const) {}
