import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductStatus } from '../product-status.enum';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ProductImages } from './product-images.entity';

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

  @IsInt()
  @IsNotEmpty()
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

  @OneToMany(() => ProductImages, (productImage) => productImage.product)
  productImages: ProductImages[];
}
