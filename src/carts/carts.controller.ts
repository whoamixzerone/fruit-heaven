import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { User } from '../common/decorators/user.decorator';
import { Users } from '../users/entities/user.entity';
import { JwtAccessAuthGuard } from '../auth/jwt-access-auth.guard';
import { CreateCartRequestDto } from './dto/create-cart.request.dto';
import { CartResponseDto } from './dto/cart.response.dto';
import { ProductsService } from '../products/products.service';

@Controller('carts')
@UseGuards(JwtAccessAuthGuard)
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  async createCart(
    @User() user: Users,
    @Body() createCartRequestDto: CreateCartRequestDto,
  ): Promise<string> {
    const { ProductId, quantity } = createCartRequestDto;
    let cart;

    cart = await this.cartsService.findCartByUserId(user.id); // 고객의 카트가 있는지 조회
    if (!cart) {
      cart = await this.cartsService.createCart(user.id); // 고객의 카트 생성
    }

    const cartProduct = await this.cartsService.findCartProductByIds(
      cart.id,
      ProductId,
    ); // 카트에 상품이 있는지 조회

    const result = cartProduct
      ? await this.cartsService.updateSumQuantity(
          // 고객의 존재하는 카트 상품에 갯수를 추가
          cart.id,
          ProductId,
          quantity,
        )
      : await this.cartsService.createCartProduct(
          // 고객의 카트에 상품 새로 추가
          cart.id,
          ProductId,
          quantity,
        );

    if (!result) {
      throw new BadRequestException();
    }

    return 'ok';
  }

  @Get()
  async findCarts(@User() user: Users): Promise<CartResponseDto[] | []> {
    const cart = await this.cartsService.findCartByUserId(user.id); // 고객의 카트가 있는지 조회, 없으면 빈 배열 반환
    if (!cart) {
      return [];
    }

    const result = await this.cartsService.findCartProductsByCartId(cart.id); // 장바구니 전체 조회
    return CartResponseDto.toModel(result);
  }

  @Patch(':id')
  async updateCart(
    @User() user: Users,
    @Param('id', ParseIntPipe) id: number,
    @Body() createCartRequestDto: CreateCartRequestDto,
  ): Promise<CartResponseDto[]> {
    const { ProductId, quantity } = createCartRequestDto;

    const product = await this.productsService.getStock(ProductId);
    if (product.stock < quantity) {
      throw new BadRequestException('재고 수량이 부족합니다.');
    }

    const result = await this.cartsService.updateQuantity(
      id,
      ProductId,
      quantity,
    );
    if (!result) {
      throw new BadRequestException();
    }

    const cartProducts = await this.cartsService.findCartProductsByCartId(id); // 업데이트 후 전체 조회
    return CartResponseDto.toModel(cartProducts);
  }
}
