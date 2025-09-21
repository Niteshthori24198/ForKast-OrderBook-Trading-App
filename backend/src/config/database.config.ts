import { DataSource, DataSourceOptions } from "typeorm";
import { Order } from "../order/entities/order.entity";
import { Trade } from "../trade/entities/trade.entity";
import * as dotenv from "dotenv";
import { ENV_TYPE } from "src/constants/constants";

dotenv.config();

export const DatabaseConfig: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "orderbook",
  entities: [Order, Trade],
  migrations: ["dist/migrations/*.js"],
  synchronize: process.env.NODE_ENV !== ENV_TYPE.PROD,
  ssl:
    process.env.NODE_ENV === ENV_TYPE.PROD
      ? { rejectUnauthorized: false }
      : false,
};

export default new DataSource(DatabaseConfig);
