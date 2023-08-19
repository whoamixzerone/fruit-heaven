import { PickType } from '@nestjs/mapped-types';
import { Carts } from '../entities/cart.entity';

export class CartResponseDto extends PickType(Carts, [
  'ProductId',
  'quantity',
] as const) {
  unitPrice: number;
  totalPrice: number;
}
