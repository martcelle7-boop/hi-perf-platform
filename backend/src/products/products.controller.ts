import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService, ProductWithNetworks, NetworkSummary } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // === PRODUCT CRUD ===

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ValidationPipe()) createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query('q') q?: string,
    @Query('isActive') isActive?: string,
    @Query('networkId', new ValidationPipe({ transform: true }))
    networkId?: string,
  ) {
    const query: any = {};
    if (q) query.q = q;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (networkId) query.networkId = parseInt(networkId, 10);

    return this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }

  // === PRODUCT ↔ NETWORK VISIBILITY ===

  @Post(':id/networks/:networkId')
  @HttpCode(HttpStatus.CREATED)
  async addNetwork(
    @Param('id', ParseIntPipe) productId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
  ) {
    return this.productsService.addNetwork(productId, networkId);
  }

  @Delete(':id/networks/:networkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeNetwork(
    @Param('id', ParseIntPipe) productId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
  ): Promise<void> {
    return this.productsService.removeNetwork(productId, networkId);
  }

  @Get(':id/networks')
  async getNetworks(
    @Param('id', ParseIntPipe) productId: number,
  ) {
    return this.productsService.getNetworks(productId);
  }
}
