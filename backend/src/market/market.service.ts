import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, In } from "typeorm";
import { Order, OrderStatus } from "../order/entities/order.entity";
import { Trade } from "../trade/entities/trade.entity";

export interface MarketSummary {
  lastPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  totalTrades: number;
  openOrders: number;
  highPrice24h: number;
  lowPrice24h: number;
}

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>
  ) {}

  async getMarketSummary(): Promise<MarketSummary> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get all trades for calculations
    const allTrades = await this.tradeRepository.find({
      order: { executedAt: "ASC" },
    });

    // Get trades from last 24 hours
    const trades24h = await this.tradeRepository.find({
      where: {
        executedAt: MoreThan(yesterday),
      },
      order: { executedAt: "ASC" },
    });

    // Get open orders count
    const openOrders = await this.orderRepository.count({
      where: {
        status: In([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]),
      },
    });

    // Calculate metrics
    const lastPrice =
      allTrades.length > 0 ? Number(allTrades[allTrades.length - 1].price) : 0;
    const firstPrice24h =
      trades24h.length > 0 ? Number(trades24h[0].price) : lastPrice;
    const priceChange24h = lastPrice - firstPrice24h;
    const priceChangePercent24h =
      firstPrice24h > 0 ? (priceChange24h / firstPrice24h) * 100 : 0;

    const volume24h = trades24h.reduce(
      (sum, trade) => sum + Number(trade.price) * Number(trade.quantity),
      0
    );

    const prices24h = trades24h.map((trade) => Number(trade.price));
    const highPrice24h =
      prices24h.length > 0 ? Math.max(...prices24h) : lastPrice;
    const lowPrice24h =
      prices24h.length > 0 ? Math.min(...prices24h) : lastPrice;

    return {
      lastPrice,
      priceChange24h,
      priceChangePercent24h,
      volume24h,
      totalTrades: allTrades.length,
      openOrders,
      highPrice24h,
      lowPrice24h,
    };
  }
}
