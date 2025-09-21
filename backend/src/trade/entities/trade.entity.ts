import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("trades")
export class Trade {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  buyOrderId: string;

  @Column()
  sellOrderId: string;

  @Column()
  buyUserId: string;

  @Column()
  sellUserId: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantity: number;

  @CreateDateColumn()
  executedAt: Date;
}
