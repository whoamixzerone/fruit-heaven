import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersRole } from '../users/user-role.enum';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>;

const mockUsersService = () => ({
  findByEmail: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: MockService<UsersService>;
  let jwtService: MockService<JwtService>;
  let configService: MockService<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService(),
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<MockService<UsersService>>(UsersService);
    jwtService = module.get<MockService<JwtService>>(JwtService);
    configService = module.get<MockService<ConfigService>>(ConfigService);
  });

  it('AuthService 서비스 존재', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser() 유저 인증', () => {
    let email, password, user;
    beforeEach(() => {
      email = 'user1@gmail.com';
      password = '1234';
      user = {
        id: 1,
        email,
        password:
          '$2b$10$zOFnoGhOpb066FwxLDySO.FN7Nst3SmUdwr6ym0JOGZXiN7DQdWtq',
      };
    });

    it('함수 존재', () => {
      expect(service.validateUser).toBeDefined();
    });

    it('인증 성공 시 유저 정보 반환', async () => {
      const { password, ...userWithoutPassword } = user;
      usersService.findByEmail.mockReturnValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      const result = await service.validateUser(email, password);

      expect(usersService.findByEmail).toBeCalledTimes(1);
      expect(usersService.findByEmail).toBeCalledWith(email);
      expect(usersService.findByEmail).toBeTruthy();
      expect(bcrypt.compare).toBeCalledTimes(1);
      expect(bcrypt.compare).toBeCalledWith(password, user.password);
      expect(bcrypt.compare).toBeTruthy();
      expect(result).toStrictEqual(userWithoutPassword);
    });

    it('인증 실패 존재하지 않는 유저일 때', async () => {
      const errorMsg = '존재하지 않는 회원입니다.';
      usersService.findByEmail.mockReturnValue(null);

      try {
        await service.validateUser(email, password);

        expect(usersService.findByEmail).toBeCalledTimes(1);
        expect(usersService.findByEmail).toBeCalledWith(email);
        expect(bcrypt.compare).toBeCalledTimes(0);
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect((err as Error).message).toBe(errorMsg);
      }
    });

    it('인증 실패 비밀번호가 다를 때', async () => {
      const errorMsg = '아이디 혹은 비밀번호를 확인해주세요.';
      password = '1111';
      usersService.findByEmail.mockReturnValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      try {
        await service.validateUser(email, password);

        expect(usersService).toBeCalledTimes(1);
        expect(usersService).toBeCalledWith(email);
        expect(bcrypt.compare).toBeCalledTimes(1);
        expect(bcrypt.compare).toBeCalledWith(password, user.password);
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect((err as Error).message).toBe(errorMsg);
      }
    });
  });

  describe('토큰 생성', () => {
    let user, payload, accessToken, refreshToken;
    beforeEach(() => {
      user = {
        id: 1,
        email: 'user1@gmail.com',
        name: '김1',
        cellPhone: '01011112222',
        role: UsersRole.USER,
      };
      payload = {
        userId: user.id,
        username: user.name,
        role: user.role,
      };
      accessToken =
        'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJ0b2tlblR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE2ODg5NTc0NTYsImV4cCI6MTY4ODk1Nzc1Nn0.uWKeaaHi5Ty2weDnVxb1wZoJmDAvdUb3OxRWRF5KbkAIrdtXE7gmzdE7C9dyP5clhs70wZPIfxwWaoA3umV-9g';
      refreshToken =
        'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJ0b2tlblR5cGUiOiJyZWZyZXNoX3Rva2VuIiwiaWF0IjoxNjg4OTU3NDU2LCJleHAiOjE2ODkwNDM4NTZ9.ssXPLsUF9Cfli1R7OJdbNuyqbhmJOQt3gW6ivDbrpbFOGtFuReSLZ_WdaJ1O6d_pm5g0ZeycsE3m-Jn6e7mPFw';
    });

    it('generateAccessToken 함수 존재', () => {
      expect(service.generateAccessToken).toBeDefined();
    });

    it('generateRefreshToken 함수 존재', () => {
      expect(service.generateRefreshToken).toBeDefined();
    });

    it('access 토큰 생성 시 토큰 문자열 반환', async () => {
      payload = {
        ...payload,
        tokenType: 'access_token',
      };
      jwtService.signAsync.mockReturnValue(accessToken);
      const result = await service.generateAccessToken(user);

      expect(jwtService.signAsync).toBeCalledTimes(1);
      expect(jwtService.signAsync).toBeCalledWith(payload);
      expect(result).toBe(accessToken);
    });

    it('refresh 토큰 생성 시 토큰 문자열 반환', async () => {
      jwtService.signAsync.mockReturnValue(refreshToken);
      configService.get.mockReturnValue('qpwoei0192');
      configService.get.mockReturnValue('5m');
      configService.get.mockReturnValue('HS256');
      const result = await service.generateRefreshToken(user);

      expect(jwtService.signAsync).toBeCalledTimes(1);
      expect(result).toBe(refreshToken);
    });
  });

  describe('토큰 에러 핸들링', () => {
    it('TokenExpiredError 에러 시', () => {
      const date = new Date();
      const obj = new TokenExpiredError('jwt expired', date);
      const errMsg = '만료된 토큰입니다.';

      try {
        service.jwtTokenErrorHandle(obj);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect((err as Error).message).toBe(errMsg);
      }
    });

    it('JsonWebTokenError invalid token 에러 시', () => {
      const obj = new JsonWebTokenError('invalid token');
      const errMsg = '유효하지 않은 토큰입니다.';

      try {
        service.jwtTokenErrorHandle(obj);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect((err as Error).message).toBe(errMsg);
      }
    });

    it('JsonWebTokenError jwt malformed 에러 시', () => {
      const obj = new JsonWebTokenError('jwt malformed');
      const errMsg = '잘못된 구성 요소의 토큰입니다.';

      try {
        service.jwtTokenErrorHandle(obj);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect((err as Error).message).toBe(errMsg);
      }
    });

    it('JsonWebTokenError invalid signature 에러 시', () => {
      const obj = new JsonWebTokenError('invalid signature');
      const errMsg = '유효하지 않은 서명입니다.';

      try {
        service.jwtTokenErrorHandle(obj);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect((err as Error).message).toBe(errMsg);
      }
    });

    it('토큰이 존재하지 않는 에러 시', () => {
      const obj = new Error('No auth token');
      const errMsg = '토큰이 존재하지 않습니다.';

      try {
        service.jwtTokenErrorHandle(obj);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect((err as Error).message).toBe(errMsg);
      }
    });
  });
});
