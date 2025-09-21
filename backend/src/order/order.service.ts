import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, In } from "typeorm";
import { Order, OrderType, OrderStatus } from "./entities/order.entity";
import { Trade } from "../trade/entities/trade.entity";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>,
    private dataSource: DataSource
  ) {}

  // Helper function to fix floating-point precision
  private fixPrecision(value: number, decimals: number = 2): number {
    if (isNaN(value) || !isFinite(value)) {
      throw new BadRequestException(`Invalid numeric value: ${value}`);
    }
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  // Helper function to safely convert to number
  private safeToNumber(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  // Helper function to validate numeric values
  private validateNumeric(value: number, fieldName: string): number {
    if (isNaN(value) || !isFinite(value) || value < 0) {
      throw new BadRequestException(`Invalid ${fieldName}: ${value}`);
    }
    return this.fixPrecision(value);
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate order data
    if (createOrderDto.price <= 0) {
      throw new BadRequestException("Price must be greater than 0");
    }
    if (createOrderDto.quantity <= 0) {
      throw new BadRequestException("Quantity must be greater than 0");
    }
    if (!createOrderDto.userId || createOrderDto.userId.trim() === "") {
      throw new BadRequestException("User ID is required");
    }

    // Fix precision for input values
    const price = this.fixPrecision(createOrderDto.price, 2);
    const quantity = this.fixPrecision(createOrderDto.quantity, 2);

    // Use transaction to ensure data consistency
    return await this.dataSource.transaction(async (manager) => {
      const order = manager.create(Order, {
        ...createOrderDto,
        price,
        quantity,
        filledQuantity: 0,
        status: OrderStatus.OPEN,
      });

      const savedOrder = await manager.save(order);
      this.logger.log(
        `Order created: ${savedOrder.id} by user ${savedOrder.userId}`
      );

      // Execute matching logic
      await this.matchOrder(savedOrder, manager);

      // Return the updated order
      return await manager.findOne(Order, { where: { id: savedOrder.id } });
    });
  }

  async getOrderbook() {
    const [buyOrders, sellOrders] = await Promise.all([
      this.orderRepository.find({
        where: {
          type: OrderType.BUY,
          status: In([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]),
        },
        order: { price: "DESC", createdAt: "ASC" },
      }),
      this.orderRepository.find({
        where: {
          type: OrderType.SELL,
          status: In([OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED]),
        },
        order: { price: "ASC", createdAt: "ASC" },
      }),
    ]);

    return { buyOrders, sellOrders };
  }

  private async matchOrder(newOrder: Order, manager: any): Promise<void> {
    const oppositeType =
      newOrder.type === OrderType.BUY ? OrderType.SELL : OrderType.BUY;
    const priceCondition =
      newOrder.type === OrderType.BUY ? "price <= :price" : "price >= :price";
    const orderDirection = newOrder.type === OrderType.BUY ? "ASC" : "DESC";

    // Find matching orders
    const matchingOrders = await manager
      .createQueryBuilder(Order, "order")
      .where("order.type = :type", { type: oppositeType })
      .andWhere("order.status IN (:...statuses)", {
        statuses: [OrderStatus.OPEN, OrderStatus.PARTIALLY_FILLED],
      })
      .andWhere(priceCondition, { price: newOrder.price })
      .andWhere("order.userId != :userId", { userId: newOrder.userId })
      .orderBy("order.price", orderDirection)
      .addOrderBy("order.createdAt", "ASC")
      .getMany();

    this.logger.log(
      `Found ${matchingOrders.length} matching orders for order ${newOrder.id} (excluding self-trades)`
    );

    for (const matchingOrder of matchingOrders) {
      // Safely get filled quantities with default 0
      const newOrderFilled = this.safeToNumber(newOrder.filledQuantity, 0);
      const matchingOrderFilled = this.safeToNumber(
        matchingOrder.filledQuantity,
        0
      );

      // Calculate remaining quantities with precision fix
      const newOrderRemaining = this.fixPrecision(
        this.safeToNumber(newOrder.quantity) - newOrderFilled
      );
      const matchingOrderRemaining = this.fixPrecision(
        this.safeToNumber(matchingOrder.quantity) - matchingOrderFilled
      );

      if (newOrderRemaining <= 0) break;

      const tradeQuantity = this.fixPrecision(
        Math.min(newOrderRemaining, matchingOrderRemaining)
      );
      const tradePrice = this.fixPrecision(
        this.safeToNumber(matchingOrder.price),
        2
      );

      // Skip if trade quantity is effectively zero
      if (tradeQuantity <= 0) {
        continue;
      }

      this.logger.log(
        `Executing trade: ${tradeQuantity} at ${tradePrice} between orders ${newOrder.id} and ${matchingOrder.id}`
      );

      // Create trade
      const trade = manager.create(Trade, {
        buyOrderId:
          newOrder.type === OrderType.BUY ? newOrder.id : matchingOrder.id,
        sellOrderId:
          newOrder.type === OrderType.SELL ? newOrder.id : matchingOrder.id,
        buyUserId:
          newOrder.type === OrderType.BUY
            ? newOrder.userId
            : matchingOrder.userId,
        sellUserId:
          newOrder.type === OrderType.SELL
            ? newOrder.userId
            : matchingOrder.userId,
        price: tradePrice,
        quantity: tradeQuantity,
      });

      await manager.save(trade);

      // Update orders with precision-fixed values
      const newFilledQuantity = this.fixPrecision(
        newOrderFilled + tradeQuantity
      );
      const matchingFilledQuantity = this.fixPrecision(
        matchingOrderFilled + tradeQuantity
      );

      // Validate the calculated values before saving
      this.validateNumeric(newFilledQuantity, "newOrder.filledQuantity");
      this.validateNumeric(
        matchingFilledQuantity,
        "matchingOrder.filledQuantity"
      );

      newOrder.filledQuantity = newFilledQuantity;
      matchingOrder.filledQuantity = matchingFilledQuantity;

      // Calculate remaining quantities for status determination
      const newRemaining = this.fixPrecision(
        this.safeToNumber(newOrder.quantity) - newOrder.filledQuantity
      );
      const matchingRemaining = this.fixPrecision(
        this.safeToNumber(matchingOrder.quantity) - matchingOrder.filledQuantity
      );

      newOrder.status =
        newRemaining <= 0 ? OrderStatus.FILLED : OrderStatus.PARTIALLY_FILLED;
      matchingOrder.status =
        matchingRemaining <= 0
          ? OrderStatus.FILLED
          : OrderStatus.PARTIALLY_FILLED;

      await manager.save([newOrder, matchingOrder]);

      this.logger.log(
        `Trade executed: ${trade.id} - ${tradeQuantity} at ${tradePrice}`
      );
    }

    this.logger.log(
      `Order matching completed for ${newOrder.id}. Status: ${newOrder.status}, Filled: ${newOrder.filledQuantity}/${newOrder.quantity}`
    );
  }
}
