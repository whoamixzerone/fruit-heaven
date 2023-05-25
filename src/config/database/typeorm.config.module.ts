import { Module } from '@nestjs/common';
import { TypeOrmConfigService } from './typeorm.config.service';

@Module({
  providers: [TypeOrmConfigService],
})
export class TypeOrmConfigModule {}
