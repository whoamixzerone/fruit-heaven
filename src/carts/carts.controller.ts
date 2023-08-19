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

@Controller('carts')
@UseGuards(JwtAccessAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  async createCart(
    @User() user: Users,
    @Body() createCartRequestDto: CreateCartRequestDto,
  ): Promise<string> {
    const { ProductId, quantity } = createCartRequestDto;

    const cart = await this.cartsService.findProductByUserIdAndProductId(
      user.id,
      ProductId,
    );

    const result = !cart
      ? await this.cartsService.createCarts(user.id, ProductId, quantity)
      : await this.cartsService.updateSumQuantity(user.id, ProductId, quantity);
    if (!result) {
      throw new BadRequestException();
    }

    return 'ok';
  }

  @Get()
  async findCarts(@User() user: Users): Promise<CartResponseDto[]> {
    return await this.cartsService.findByUserIdCarts(user.id);
  }

  @Patch(':id')
  async updateCart(
    @User() user: Users,
    @Param('ProductId', ParseIntPipe) ProductId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<string> {
    const result = await this.cartsService.updateQuantity(
      user.id,
      ProductId,
      quantity,
    );
    if (!result) {
      throw new BadRequestException();
    }

    return 'ok';
  }
}
