import { plainToInstance } from 'class-transformer';

export class CartResponseDto {
  CartId: number;
  ProductId: number;
  quantity: number;
  title: string;
  price: number;
  imageUrl: string;
  unitPrice: number;
  totalPrice: number;

  static toModel(data: CartResponseDto[]) {
    return plainToInstance(CartResponseDto, data);
  }
}
