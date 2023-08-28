import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { User } from '../common/decorators/user.decorator';
import { Users } from '../users/entities/user.entity';
import { JwtAccessAuthGuard } from '../auth/jwt-access-auth.guard';
import { CartRequestDto } from './dto/cart.request.dto';
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
    @Body() createCartRequestDto: CartRequestDto,
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
      throw new BadRequestException('장바구니에 상품을 추가할 수 없습니다.');
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
    @Body() cartRequestDto: CartRequestDto,
  ): Promise<CartResponseDto[]> {
    if (await this.cartsService.validNotSessionIdAndCartUserId(user.id, id)) {
      // 로그인 한 고객 id와 수정할 장바구니의 고객 id가 일치하는지 확인
      throw new BadRequestException('장바구니가 일치하지 않습니다.');
    }

    const { ProductId, quantity } = cartRequestDto;

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
      throw new BadRequestException('상품 수량을 추가할 수 없습니다.');
    }

    const cartProducts = await this.cartsService.findCartProductsByCartId(id); // 업데이트 후 전체 조회
    return CartResponseDto.toModel(cartProducts);
  }

  @Delete(':id')
  async deleteCart(
    @User() user: Users,
    @Param('id', ParseIntPipe) id: number,
    @Body('ProductIds', ParseArrayPipe) ProductIds: number[],
  ) {
    if (await this.cartsService.validNotSessionIdAndCartUserId(user.id, id)) {
      // 로그인 한 고객 id와 삭제할 장바구니의 고객 id가 일치하는지 확인
      throw new BadRequestException('장바구니가 일치하지 않습니다.');
    }

    const result =
      ProductIds.length === 0
        ? await this.cartsService.deleteCarts(id) // 장바구니 전체 삭제
        : await this.cartsService.deleteCartProducts(id, ProductIds); // 장바구니 일부 삭제
    if (result) {
      return 'ok';
    } else {
      throw new BadRequestException('해당 상품을 삭제할 수 없습니다.');
    }
  }
}
