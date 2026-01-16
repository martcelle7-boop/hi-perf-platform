import {
  Controller,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AdminConfigService } from './admin-config.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface Config {
  allowMultiNetworkCart: boolean;
}

@Controller('admin/config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminConfigController {
  constructor(private readonly adminConfigService: AdminConfigService) {}

  @Get()
  async getConfig(): Promise<Config> {
    return this.adminConfigService.getConfig();
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateConfig(@Body() updateConfigDto: UpdateConfigDto): Promise<Config> {
    return this.adminConfigService.updateConfig(updateConfigDto);
  }
}
