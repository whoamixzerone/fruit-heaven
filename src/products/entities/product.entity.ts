import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductStatus } from '../product-status.enum';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ProductImages } from './product-images.entity';
import { Users } from '../../users/entities/user.entity';
import { Carts } from '../../carts/entities/cart.entity';

@Entity({ name: 'products' })
export class Products {
  @PrimaryGeneratedColumn({ name: 'product_id' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column('text', { name: 'product_title' })
  title: string;

  @Column('text', { name: 'product_content', nullable: true })
  content: string;

  @IsPositive()
  @Column('decimal', { precision: 11, scale: 0 })
  price: number;

  @IsInt()
  @IsNotEmpty()
  @Column('smallint')
  stock: number;

  @Column('enum', {
    enum: ProductStatus,
    default: ProductStatus.SALE,
  })
  status: ProductStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => ProductImages, (productImage) => productImage.product, {
    cascade: ['soft-remove'],
  })
  productImages: ProductImages[];

  @OneToMany(() => Carts, (cart) => cart.Product)
  Carts: Carts[];

  @ManyToMany(() => Users, (user) => user.Products)
  Users: Users[];
}
