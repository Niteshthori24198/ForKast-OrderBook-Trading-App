import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { MarketService } from "./market.service";

@ApiTags("market")
@Controller("market")
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get("summary")
  @ApiOperation({ summary: "Get market summary statistics" })
  @ApiResponse({ status: HttpStatus.OK, description: "Market summary data" })
  async getMarketSummary() {
    return this.marketService.getMarketSummary();
  }
}
