import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigModule } from './config/database/typeorm.config.module';
import { TypeOrmConfigService } from './config/database/typeorm.config.service';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';

const cacheModule = CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    store: redisStore as unknown as CacheStore,
    host: configService.get<string>('REDIS_HOST'),
    port: +configService.get<number>('REDIS_PORT'),
    auth_pass: configService.get<string>('REDIS_PASSWORD'),
    ttl: 100,
  }),
  inject: [ConfigService],
  isGlobal: true,
});

const typeOrmModule = TypeOrmModule.forRootAsync({
  imports: [TypeOrmConfigModule],
  useClass: TypeOrmConfigService,
  inject: [TypeOrmConfigService],
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    cacheModule,
    typeOrmModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CartsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
