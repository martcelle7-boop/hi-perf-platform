import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderFromQuotationDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /orders
   * Get user's orders
   */
  @Get()
  async getUserOrders(
    @Request() req: any,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    const userId = req.user.id;
    return this.ordersService.getUserOrders(userId, skip, take);
  }

  /**
   * GET /orders/:orderId
   * Get single order
   */
  @Get(':orderId')
  async getOrder(
    @Request() req: any,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    const userId = req.user.id;
    return this.ordersService.getOrder(userId, orderId);
  }

  /**
   * POST /orders
   * Create order from quotation
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createFromQuotation(
    @Request() req: any,
    @Body() dto: CreateOrderFromQuotationDto,
  ) {
    const userId = req.user.id;
    return this.ordersService.createFromQuotation(userId, dto);
  }

  /**
   * POST /orders/:orderId/cancel
   * Cancel order (only if PENDING_PAYMENT)
   */
  @Post(':orderId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Request() req: any,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    const userId = req.user.id;
    return this.ordersService.cancelOrder(userId, orderId);
  }
}
