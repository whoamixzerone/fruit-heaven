import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductStatus } from '../product-status.enum';
import { IsEmpty, IsInt, IsNotEmpty, IsString } from 'class-validator';

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
}
