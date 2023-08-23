import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Products } from 'src/products/entities/product.entity';
import { Carts } from './cart.entity';

@Entity({ name: 'cart_products' })
export class CartProducts {
  @PrimaryGeneratedColumn({ name: 'cart_product_id' })
  id: number;

  @PrimaryColumn({ name: 'cart_id' })
  CartId: number;

  @PrimaryColumn({ name: 'product_id' })
  ProductId: number;

  @IsInt()
  @IsNotEmpty()
  @Column()
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Carts, (carts) => carts.CartProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'cart_id', referencedColumnName: 'id' }])
  Cart: Carts;

  @ManyToOne(() => Products, (product) => product.CartProducts)
  @JoinColumn([{ name: 'product_id', referencedColumnName: 'id' }])
  Product: Products;
}
