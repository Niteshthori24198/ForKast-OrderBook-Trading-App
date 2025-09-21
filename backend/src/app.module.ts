import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { TradeModule } from './trade/trade.module';
import { MarketModule } from './market/market.module';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(DatabaseConfig),
    OrderModule,
    TradeModule,
    MarketModule,
  ],
})
export class AppModule {}
