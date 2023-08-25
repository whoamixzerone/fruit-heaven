import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Carts } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartResponseDto } from './dto/cart.response.dto';
import { ProductImages } from '../products/entities/product-images.entity';
import { CartProducts } from './entities/cart-products.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Carts)
    private readonly cartsRepository: Repository<Carts>,
    @InjectRepository(CartProducts)
    private readonly cartProductsRepository: Repository<CartProducts>,
  ) {}

  async findCartByUserId(UserId: number): Promise<Carts> {
    return await this.cartsRepository.findOne({ where: { UserId } });
  }

  async findCartProductByIds(
    CartId: number,
    ProductId: number,
  ): Promise<CartProducts> {
    return await this.cartProductsRepository.findOne({
      where: {
        CartId,
        ProductId,
      },
      select: ['id', 'CartId', 'ProductId'],
    });
  }

  async createCart(UserId: number): Promise<Carts> {
    const cart = this.cartsRepository.create({ UserId });

    try {
      return await this.cartsRepository.save(cart);
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  async createCartProduct(
    CartId: number,
    ProductId: number,
    quantity: number,
  ): Promise<boolean> {
    const cartProduct = this.cartProductsRepository.create();
    cartProduct.CartId = CartId;
    cartProduct.ProductId = ProductId;
    cartProduct.quantity = quantity;

    try {
      await this.cartProductsRepository.save(cartProduct);

      return true;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  async updateSumQuantity(
    CartId: number,
    ProductId: number,
    quantity: number,
  ): Promise<boolean> {
    try {
      const result = await this.cartProductsRepository.update(
        {
          CartId,
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

  async findCartProductsByCartId(CartId: number): Promise<CartResponseDto[]> {
    return await this.cartProductsRepository
      .createQueryBuilder('cartProduct')
      .select([
        'cartProduct.CartId as CartId',
        'cartProduct.ProductId as ProductId',
        'cartProduct.quantity as quantity',
        'products.title as title',
        'products.price as price',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('image.imageUrl', 'imageUrl')
          .from(ProductImages, 'image')
          .where('image.ProductId = cartProduct.ProductId')
          .limit(1);
      }, 'imageUrl')
      .addSelect('cartProduct.quantity * products.price', 'unitPrice')
      .addSelect((subQuery) => {
        return subQuery
          .select('SUM(cp.quantity * products.price)', 'totalPrice')
          .from(CartProducts, 'cp')
          .innerJoin('cp.Product', 'products')
          .where('cartProduct.CartId = :CartId', { CartId });
      }, 'totalPrice')
      .innerJoin('cartProduct.Product', 'products')
      .where('cartProduct.CartId = :CartId', { CartId })
      .orderBy('cartProduct.createdAt', 'DESC')
      .getRawMany();
  }

  async updateQuantity(
    CartId: number,
    ProductId: number,
    quantity: number,
  ): Promise<boolean> {
    try {
      const result = await this.cartProductsRepository.update(
        {
          CartId,
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
