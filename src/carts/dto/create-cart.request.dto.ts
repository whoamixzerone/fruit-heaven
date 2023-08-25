import { PickType } from '@nestjs/mapped-types';
import { CartProducts } from '../entities/cart-products.entity';

export class CreateCartRequestDto extends PickType(CartProducts, [
  'ProductId',
  'quantity',
] as const) {}
