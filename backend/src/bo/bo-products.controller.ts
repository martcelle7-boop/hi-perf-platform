import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BoProductsService } from './bo-products.service';
import { CreateBoProductDto } from './dto/create-bo-product.dto';
import { UpdateBoProductDto } from './dto/update-bo-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Product } from '@prisma/client';

@Controller('bo/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('BO', 'ADMIN')
export class BoProductsController {
  constructor(private readonly boProductsService: BoProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBoProductDto: CreateBoProductDto): Promise<Product> {
    return this.boProductsService.create(createBoProductDto);
  }

  @Get()
  async findAll(): Promise<Product[]> {
    return this.boProductsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.boProductsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoProductDto: UpdateBoProductDto,
  ): Promise<Product> {
    return this.boProductsService.update(id, updateBoProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.boProductsService.remove(id);
  }
}
