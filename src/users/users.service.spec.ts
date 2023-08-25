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
  findOne: jest.fn(),
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
        role: UsersRole.USER,
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
      } as Users;
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

  describe('유저 찾기', () => {
    let email, cellPhone, findOneOptions, user;
    beforeEach(() => {
      email = 'user1@gmail.com';
      cellPhone = '01011112222';
      findOneOptions = {
        where: { email },
        select: ['id', 'email'],
      };
      user = { id: 1, email: 'user1@gmail.com' };
    });

    describe('findByEmail 이메일로 유저 찾기', () => {
      beforeEach(() => {
        const { where, select } = findOneOptions;
        findOneOptions = {
          where,
          select: [...select, 'password'],
        };
        user = {
          password:
            '$2b$10$zOFnoGhOpb066FwxLDySO.FN7Nst3SmUdwr6ym0JOGZXiN7DQdWtq',
          ...user,
        };
      });

      it('함수 존재', () => {
        expect(service.findByEmail).toBeDefined();
      });

      it('이메일이 존재하면 유저 정보 반환', async () => {
        usersRepository.findOne.mockReturnValue(user);
        const result = await service.findByEmail(email);

        expect(usersRepository.findOne).toBeCalledTimes(1);
        expect(usersRepository.findOne).toBeCalledWith(findOneOptions);
        expect(result).toStrictEqual(user);
      });

      it('이메일이 없으면 null 반환', async () => {
        const { select } = findOneOptions;
        email = '1user1@gmail.com';
        findOneOptions = {
          where: { email },
          select,
        };
        usersRepository.findOne.mockReturnValue(null);
        const result = await service.findByEmail(email);

        expect(usersRepository.findOne).toBeCalledTimes(1);
        expect(usersRepository.findOne).toBeCalledWith(findOneOptions);
        expect(result).toBeNull();
      });
    });

    describe('findByCellphone 핸드폰으로 유저 찾기', () => {
      beforeEach(() => {
        const { select } = findOneOptions;
        findOneOptions = {
          where: { cellPhone },
          select: [...select, 'cellPhone'],
        };
        user = {
          cellPhone: '01011112222',
          ...user,
        };
      });

      it('함수 존재', () => {
        expect(service.findByCellphone).toBeDefined();
      });

      it('핸드폰이 존재하면 유저 정보 반환', async () => {
        usersRepository.findOne.mockReturnValue(user);
        const result = await service.findByCellphone(cellPhone);

        expect(usersRepository.findOne).toBeCalledTimes(1);
        expect(usersRepository.findOne).toBeCalledWith(findOneOptions);
        expect(result).toStrictEqual(user);
      });

      it('핸드폰이 없으면 null 반환', async () => {
        const { select } = findOneOptions;
        cellPhone = '01011112223';
        findOneOptions = {
          where: { cellPhone },
          select,
        };
        usersRepository.findOne.mockReturnValue(null);
        const result = await service.findByCellphone(cellPhone);

        expect(usersRepository.findOne).toBeCalledTimes(1);
        expect(usersRepository.findOne).toBeCalledWith(findOneOptions);
        expect(result).toBeNull();
      });
    });

    describe('findById 아이디로 유저 찾기', () => {
      let id;
      beforeEach(() => {
        const { select } = findOneOptions;
        id = 1;
        findOneOptions = {
          where: { id },
          select: [...select, 'name', 'cellPhone'],
        };
        user = {
          ...user,
          name: '김1',
          cellPhone,
        };
      });

      it('함수 존재', () => {
        expect(service.findById).toBeDefined();
      });

      it('아이디가 존재하면 유저 정보 반환', async () => {
        usersRepository.findOne.mockReturnValue(user);
        const result = await service.findById(id);

        expect(usersRepository.findOne).toBeCalledTimes(1);
        expect(usersRepository.findOne).toBeCalledWith(findOneOptions);
        expect(result).toStrictEqual(user);
      });

      it('아이디가 없으면 null 반환', async () => {
        const { select } = findOneOptions;
        id = 9999;
        findOneOptions = {
          where: { id },
          select,
        };
        usersRepository.findOne.mockReturnValue(null);
        const result = await service.findById(id);

        expect(usersRepository.findOne).toBeCalledTimes(1);
        expect(usersRepository.findOne).toBeCalledWith(findOneOptions);
        expect(result).toBeNull();
      });
    });
  });
});
