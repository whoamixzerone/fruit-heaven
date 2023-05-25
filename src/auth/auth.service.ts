import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Users } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly dataSource: DataSource,
  ) {}

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
  }) {
    const existEmail = await this.usersRepository.findOne({ where: { email } });
    if (existEmail) {
      throw new ConflictException('사용중인 이메일입니다.');
    }
    const existCellPhone = await this.usersRepository.findOne({
      where: { cellPhone },
    });
    if (existCellPhone) {
      throw new ConflictException('사용중인 핸드폰입니다.');
    }

    const user = await this.usersRepository.create({
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

  // async logIn() {}
  // async logOut() {}
}
