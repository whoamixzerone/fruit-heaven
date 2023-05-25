import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(
    connectionName?: string,
  ): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('MYSQL_HOST'),
      port: +this.configService.get<number>('MYSQL_PORT'),
      username: this.configService.get<string>('MYSQL_USERNAME'),
      password: this.configService.get<string>('MYSQL_PASSWORD'),
      database: this.configService.get<string>('MYSQL_DATABASE'),
      entities: [__dirname + '/../../**/**/*.entity.{js,ts}'],
      charset: 'utf8mb4_unicode_ci',
      synchronize: this.configService.get<boolean>('MYSQL_SYNCHRONIZE'),
      logging: this.configService.get<boolean>('MYSQL_LOGGING'),
    };
  }
}
