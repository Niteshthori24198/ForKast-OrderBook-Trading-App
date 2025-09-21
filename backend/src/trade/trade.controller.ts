import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { TradeService } from "./trade.service";

@ApiTags("trades")
@Controller("trades")
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Get("history")
  @ApiOperation({ summary: "Get trade history" })
  @ApiResponse({ status: HttpStatus.OK, description: "Trade history" })
  async getTradeHistory() {
    return this.tradeService.getTradeHistory();
  }
}
