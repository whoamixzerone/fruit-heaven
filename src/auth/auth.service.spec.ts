import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { UsersRole } from '../users/user-role.enum';
import { JoinRequestDto } from '../users/dto/join.request.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockUsersRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: MockRepository<Users>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUsersRepository(),
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<MockRepository<Users>>(
      getRepositoryToken(Users),
    );
  });

  it('AuthService 서비스 존재', () => {
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
