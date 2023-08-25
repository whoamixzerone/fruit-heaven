import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carts } from './entities/cart.entity';
import { Users } from '../users/entities/user.entity';
import { Products } from '../products/entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { CartProducts } from './entities/cart-products.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Products, Carts, CartProducts]),
    ProductsModule,
  ],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
