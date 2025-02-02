import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { HarvestService } from './harvest.service';

@Controller('harvest')
export class HarvestController {
  private readonly logger = new Logger(HarvestController.name);
  private readonly harvestService: HarvestService;

  constructor(harvestService: HarvestService) {
    this.harvestService = harvestService;
  }

  @Post()
  async ask(@Body('message') message: string) {
    return this.harvestService.ask(message);
  }
}
