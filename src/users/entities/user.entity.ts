import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersRole } from '../user-role.enum';
import bcrypt from 'bcrypt';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Products } from '../../products/entities/product.entity';
import { Carts } from '../../carts/entities/cart.entity';

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @IsEmail()
  @IsNotEmpty()
  @Column('varchar', { unique: true, length: 50 })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4, {
    message: '비밀번호는 최소 4자 이상입니다.',
  })
  @Column('varchar', { length: 100, select: false })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, {
    message: '이름은 2자 이상입니다.',
  })
  @Column('varchar', { length: 30 })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 11, {
    message: '핸드폰 번호는 10~11자 입니다.',
  })
  @Column('varchar', { name: 'cell_phone', unique: true, length: 11 })
  cellPhone: string;

  @Column('enum', {
    enum: UsersRole,
    default: UsersRole.USER,
  })
  role: UsersRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => Carts, (cart) => cart.User)
  Carts: Carts[];

  @ManyToMany(() => Products, (product) => product.Users)
  @JoinTable({
    name: 'carts',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  Products: Products[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const saltOrRounds = 10;
      this.password = await bcrypt.hash(this.password, saltOrRounds);
    }
  }
}
