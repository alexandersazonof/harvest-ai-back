import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HarvestModule } from './harvest/harvest.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [ConfigModule.forRoot(), HarvestModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
