import { PickType } from '@nestjs/mapped-types';
import { Products } from '../entities/product.entity';

export class CreateProductRequestDto extends PickType(Products, [
  'title',
  'content',
  'price',
  'stock',
] as const) {}
