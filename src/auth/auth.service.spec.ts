import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DataSource } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('AuthService 서비스 존재', () => {
    expect(service).toBeDefined();
  });
});
