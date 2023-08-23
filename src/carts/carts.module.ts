import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carts } from './entities/cart.entity';
import { Users } from '../users/entities/user.entity';
import { Products } from '../products/entities/product.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Products, Carts]), ProductsModule],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
