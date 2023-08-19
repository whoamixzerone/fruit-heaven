import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { Products } from '../../products/entities/product.entity';
import { IsInt, IsNotEmpty } from 'class-validator';

@Entity({ name: 'carts' })
export class Carts {
  @PrimaryColumn({ name: 'user_id' })
  UserId: number;

  @PrimaryColumn({ name: 'product_id' })
  ProductId: number;

  @IsInt()
  @IsNotEmpty()
  @Column()
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Users, (user) => user.Carts)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  User: Users;

  @ManyToOne(() => Products, (product) => product.Carts)
  @JoinColumn([{ name: 'product_id', referencedColumnName: 'id' }])
  Product: Products;
}
