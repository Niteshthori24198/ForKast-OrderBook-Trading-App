import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { Order } from '../order/entities/order.entity';
import { Trade } from '../trade/entities/trade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Trade])],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
