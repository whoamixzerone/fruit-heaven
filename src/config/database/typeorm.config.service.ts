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
      host: this.configService.get('MYSQL_HOST'),
      port: +this.configService.get('MYSQL_PORT'),
      username: this.configService.get('MYSQL_USERNAME'),
      password: this.configService.get('MYSQL_PASSWORD'),
      database: this.configService.get('MYSQL_DATABASE'),
      entities: [__dirname + '/../../**/**/*.entity.{js,ts}'],
      charset: 'utf8mb4_unicode_ci',
      timezone: 'Z',
      synchronize: JSON.parse(this.configService.get('MYSQL_SYNCHRONIZE')),
      logging: JSON.parse(this.configService.get('MYSQL_LOGGING')),
    };
  }
}
