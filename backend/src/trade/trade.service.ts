import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trade } from './entities/trade.entity';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>,
  ) {}

  async getTradeHistory(): Promise<Trade[]> {
    return this.tradeRepository.find({
      order: { executedAt: 'DESC' },
    });
  }
}
