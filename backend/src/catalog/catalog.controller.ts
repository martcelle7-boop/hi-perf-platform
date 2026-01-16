import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * GET /catalog
   * Get products with effective pricing based on user's network
   * Query params:
   *   - q: search term
   *   - networkId: specific network (optional, defaults to user's primary)
   *   - type: product type filter (GENERIC|NORMAL|PARTNER)
   *   - skip: pagination offset (default 0)
   *   - take: page size (default 50)
   */
  @Get()
  async getCatalog(
    @Request() req: any,
    @Query('q') q?: string,
    @Query('networkId', new ParseIntPipe({ optional: true }))
    networkId?: number,
    @Query('type')
    type?: 'GENERIC' | 'NORMAL' | 'PARTNER',
    @Query('skip', new ParseIntPipe({ optional: true }))
    skip?: number,
    @Query('take', new ParseIntPipe({ optional: true }))
    take?: number,
  ) {
    const userId = req.user.id;

    return this.catalogService.getCatalog(userId, {
      q,
      networkId,
      type,
      skip,
      take,
    });
  }

  /**
   * GET /catalog/:productId
   * Get single product detail with effective pricing
   */
  @Get(':productId')
  async getProductDetail(
    @Request() req: any,
    @Param('productId', ParseIntPipe) productId: number,
    @Query('networkId', new ParseIntPipe({ optional: true }))
    networkId?: number,
  ) {
    const userId = req.user.id;
    return this.catalogService.getProductDetail(userId, productId, networkId);
  }

  /**
   * GET /catalog/search/:term
   * Quick search endpoint
   */
  @Get('search/:term')
  async search(
    @Request() req: any,
    @Param('term') term: string,
    @Query('type')
    type?: 'GENERIC' | 'NORMAL' | 'PARTNER',
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit?: number,
  ) {
    const userId = req.user.id;
    return this.catalogService.searchProducts(userId, term, type, limit);
  }
}
