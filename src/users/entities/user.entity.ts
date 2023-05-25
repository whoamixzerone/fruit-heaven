import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersRole } from '../user-role.enum';
import bcrypt from 'bcrypt';

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column('varchar', { unique: true, length: 50 })
  email: string;

  @Column('varchar', { length: 100, select: false })
  password: string;

  @Column('varchar', { length: 30 })
  name: string;

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

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const saltOrRounds = 10;
      this.password = await bcrypt.hash(this.password, saltOrRounds);
    }
  }
}
