import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({ example: 100.50 })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 'user123' })
  @IsString()
  userId: string;
}
