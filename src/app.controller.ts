import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HarvestService } from './harvest/harvest.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly harvestService: HarvestService,
  ) {}

  @Get()
  async ping(): Promise<string> {
    return this.appService.ping();
  }
}
