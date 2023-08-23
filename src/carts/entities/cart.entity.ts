import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { CartProducts } from './cart-products.entity';

@Entity({ name: 'carts' })
export class Carts {
  @PrimaryGeneratedColumn({ name: 'cart_id' })
  id: number;

  @PrimaryColumn({ name: 'user_id' })
  UserId: number;

  @OneToOne(() => Users, (user) => user.Cart)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  User: Users;

  @OneToMany(() => CartProducts, (cartProduct) => cartProduct.Cart, {
    cascade: ['remove'],
    orphanedRowAction: 'delete',
  })
  CartProducts: CartProducts[];
}
