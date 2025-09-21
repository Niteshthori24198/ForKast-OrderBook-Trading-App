import { Controller, Get, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Order placed successfully' })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get('orderbook')
  @ApiOperation({ summary: 'Get current orderbook state' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Current orderbook' })
  async getOrderbook() {
    return this.orderService.getOrderbook();
  }
}
