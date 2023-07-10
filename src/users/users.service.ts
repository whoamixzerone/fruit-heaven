import { Injectable } from '@nestjs/common';
import { JoinRequestDto } from './dto/join.request.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async findByEmail(email: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });
  }

  async findByCellphone(cellPhone: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { cellPhone },
      select: ['id', 'email', 'cellPhone'],
    });
  }

  async findById(id: number): Promise<UserDto | null> {
    return await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'cellPhone'],
    });
  }

  async join({
    email,
    password,
    name,
    cellPhone,
  }: {
    email: string;
    password: string;
    name: string;
    cellPhone: string;
  }): Promise<boolean> {
    const user: Users = this.usersRepository.create({
      email,
      password,
      name,
      cellPhone,
    });

    try {
      await this.usersRepository.save(user);
      return true;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  create(createUserDto: JoinRequestDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
