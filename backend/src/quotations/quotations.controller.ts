import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationItemDto, UpdateQuotationItemDto, UpdateQuotationStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('quotations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  /**
   * Get current draft quotation (or create if missing)
   */
  @Get('current')
  @Roles('USER', 'BO', 'ADMIN')
  async getCurrentQuotation(@Request() req: any) {
    const networkId = req.user.networkId || 1;
    return this.quotationsService.getCurrentQuotation(req.user.id, networkId);
  }

  /**
   * Get all quotations for the current user
   */
  @Get()
  @Roles('USER', 'BO', 'ADMIN')
  async getUserQuotations(@Request() req: any) {
    return this.quotationsService.getUserQuotations(req.user.id);
  }

  /**
   * Get a specific quotation by ID
   */
  @Get(':id')
  @Roles('USER', 'BO', 'ADMIN')
  async getQuotationById(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.quotationsService.getQuotationById(id, req.user.id, req.user.role);
  }

  /**
   * Add product to current quotation
   */
  @Post('current/items')
  @HttpCode(HttpStatus.CREATED)
  @Roles('USER', 'BO', 'ADMIN')
  async addItem(
    @Request() req: any,
    @Body(new ValidationPipe()) dto: CreateQuotationItemDto,
  ) {
    const networkId = req.user.networkId || 1;
    return this.quotationsService.addItemToQuotation(
      req.user.id,
      dto,
      networkId,
    );
  }

  /**
   * Update quantity of an item in DRAFT quotation
   */
  @Patch('items/:itemId')
  @Roles('USER', 'BO', 'ADMIN')
  async updateItem(
    @Request() req: any,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body(new ValidationPipe()) dto: UpdateQuotationItemDto,
  ) {
    return this.quotationsService.updateItemQuantity(req.user.id, itemId, dto);
  }

  /**
   * Remove product from current quotation
   */
  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @Roles('USER', 'BO', 'ADMIN')
  async removeItem(
    @Request() req: any,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.quotationsService.removeItemFromQuotation(
      req.user.id,
      itemId,
    );
  }

  /**
   * Submit quotation (change status to SENT)
   */
  @Post('current/submit')
  @HttpCode(HttpStatus.OK)
  @Roles('USER', 'BO', 'ADMIN')
  async submitQuotation(
    @Request() req: any,
    @Body(new ValidationPipe()) dto: UpdateQuotationStatusDto,
  ) {
    return this.quotationsService.updateQuotationStatus(req.user.id, dto);
  }

  /**
   * Update quotation status (ADMIN/BO only)
   */
  @Patch(':id/status')
  @Roles('ADMIN', 'BO')
  async updateStatus(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) dto: UpdateQuotationStatusDto,
  ) {
    // TODO: Implement admin update status
    return { message: 'Not implemented yet' };
  }
}

