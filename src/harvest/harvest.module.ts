import { Module } from '@nestjs/common';
import { HarvestService } from './harvest.service';
import { ConfigModule } from '@nestjs/config';
import { HarvestController } from './harvest.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ConfigModule, AiModule],
  providers: [HarvestService],
  exports: [HarvestService],
  controllers: [HarvestController],
})
export class HarvestModule {}
