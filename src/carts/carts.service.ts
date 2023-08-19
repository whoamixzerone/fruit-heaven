import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Carts } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartResponseDto } from './dto/cart.response.dto';
import { ProductImages } from '../products/entities/product-images.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Carts)
    private readonly cartsRepository: Repository<Carts>,
  ) {}

  async findProductByUserIdAndProductId(
    UserId: number,
    ProductId: number,
  ): Promise<Carts> {
    return await this.cartsRepository.findOne({
      where: {
        UserId,
        ProductId,
      },
      select: ['UserId', 'ProductId', 'quantity'],
    });
  }

  async createCarts(
    UserId: number,
    ProductId: number,
    quantity: number,
  ): Promise<boolean> {
    const cart = this.cartsRepository.create({
      UserId,
      ProductId,
      quantity,
    });

    try {
      await this.cartsRepository.save(cart);

      return true;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  async findByUserIdCarts(UserId: number): Promise<CartResponseDto[]> {
    return await this.cartsRepository
      .createQueryBuilder('carts')
      .select([
        'carts.ProductId as ProductId',
        'carts.quantity as quantity',
        'products.title as title',
        'products.price as price',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('image.imageUrl', 'imageUrl')
          .from(ProductImages, 'image')
          .where('image.ProductId = carts.ProductId')
          .limit(1);
      }, 'imageUrl')
      .addSelect('carts.quantity * products.price', 'unitPrice')
      .addSelect((subQuery) => {
        return subQuery
          .select('SUM(carts.quantity * products.price)', 'totalPrice')
          .from(Carts, 'carts')
          .innerJoin('carts.Product', 'products')
          .where('carts.UserId = :UserId', { UserId });
      }, 'totalPrice')
      .innerJoin('carts.Product', 'products')
      .where('carts.UserId = :UserId', { UserId })
      .getRawMany();
  }

  async updateSumQuantity(
    UserId: number,
    ProductId: number,
    quantity: number,
  ): Promise<boolean> {
    try {
      const result = await this.cartsRepository.update(
        {
          UserId,
          ProductId,
        },
        {
          quantity: () => `quantity + ${quantity}`,
        },
      );
      if (result.affected === 0) {
        return false;
      }

      return true;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  async updateQuantity(
    UserId: number,
    ProductId: number,
    quantity: number,
  ): Promise<boolean> {
    try {
      const result = await this.cartsRepository.update(
        {
          UserId,
          ProductId,
        },
        { quantity },
      );
      if (result.affected === 0) {
        return false;
      }

      return true;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }
}
