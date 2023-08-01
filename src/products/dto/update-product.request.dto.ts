import { PartialType } from '@nestjs/mapped-types';
import { CreateProductRequestDto } from './create-product.request.dto';
import { ProductStatus } from '../product-status.enum';

export class UpdateProductRequestDto extends PartialType(
  CreateProductRequestDto,
) {
  status?: ProductStatus;
}
