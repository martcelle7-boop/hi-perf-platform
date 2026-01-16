import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationItemDto, UpdateQuotationStatusDto } from './dto';

@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  /**
   * Get current draft quotation
   */
  @Get('current')
  async getCurrentQuotation(@Request() req: any) {
    return this.quotationsService.getCurrentQuotation(req.user.id);
  }

  /**
   * Add product to current quotation
   */
  @Post('current/items')
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @Request() req: any,
    @Body(new ValidationPipe()) dto: CreateQuotationItemDto,
  ) {
    const networkId = req.user.networkId || 1; // TODO: get from user context
    return this.quotationsService.addItemToQuotation(
      req.user.id,
      dto,
      networkId,
    );
  }

  /**
   * Remove product from current quotation
   */
  @Delete('current/items/:itemId')
  @HttpCode(HttpStatus.OK)
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
  async submitQuotation(
    @Request() req: any,
    @Body(new ValidationPipe()) dto: UpdateQuotationStatusDto,
  ) {
    return this.quotationsService.updateQuotationStatus(req.user.id, dto);
  }
}
