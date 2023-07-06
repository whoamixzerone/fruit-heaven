import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JoinRequestDto } from './dto/join.request.dto';
import { UsersRole } from './user-role.enum';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockUsersRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<Users>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUsersRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<MockRepository<Users>>(
      getRepositoryToken(Users),
    );
  });

  it('userService 서비스 존재', () => {
    expect(service).toBeDefined();
  });

  describe('회원가입 Post /auth/join', () => {
    let joinUser: JoinRequestDto;
    let saveUser: Omit<Users, 'hashPassword'>;
    let now: Date;
    beforeEach(() => {
      joinUser = {
        email: 'user1@gmail.com',
        password: '1234',
        name: '홍길동',
        cellPhone: '01011112222',
      };
      now = new Date();
      saveUser = {
        id: 1,
        email: 'user1@gmail.com',
        password:
          '$2b$10$zOFnoGhOpb066FwxLDySO.FN7Nst3SmUdwr6ym0JOGZXiN7DQdWtq',
        name: '홍길동',
        cellPhone: '01011112222',
        role: UsersRole.USER,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
    });

    it('join 함수 존재', () => {
      expect(service.join).toBeDefined();
    });

    it('회원가입 성공 true 반환', async () => {
      usersRepository.create.mockReturnValue(joinUser);
      usersRepository.save.mockReturnValue(saveUser);

      const result = await service.join(joinUser);
      expect(usersRepository.create).toBeCalledTimes(1);
      expect(usersRepository.save).toBeCalledTimes(1);
      expect(usersRepository.create).toBeCalledWith(joinUser);
      expect(usersRepository.save).toBeCalledWith(joinUser);
      expect(result).toBeTruthy();
    });

    it('회원가입 실패 error 반환', async () => {
      const errorMsg = { message: 'Internal Server Error' };
      const reject = Promise.reject(errorMsg);
      usersRepository.create.mockReturnValue(joinUser);
      usersRepository.save.mockRejectedValue(errorMsg);

      try {
        await service.join(joinUser);
      } catch (err: unknown) {
        expect(err).toStrictEqual(errorMsg);
      }
    });
  });
});
