import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { Trade } from '../trade/entities/trade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Trade])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
