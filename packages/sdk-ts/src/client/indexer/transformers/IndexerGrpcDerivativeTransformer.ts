import {
  TradeDirection,
  TradeExecutionSide,
  TradeExecutionType,
} from '@injectivelabs/ts-types'
import { BigNumber } from '@injectivelabs/utils'
import {
  DerivativeOrderSide,
  DerivativeOrderState,
  GrpcDerivativeMarketInfo,
  GrpcDerivativeLimitOrder,
  GrpcDerivativeTrade,
  DerivativeMarket,
  DerivativeLimitOrder,
  DerivativeTrade,
  PositionDelta,
  GrpcDerivativePosition,
  Position,
  GrpcPositionDelta,
  PerpetualMarketInfo,
  GrpcPerpetualMarketInfo,
  GrpcPerpetualMarketFunding,
  PerpetualMarketFunding,
  GrpcExpiryFuturesMarketInfo,
  GrpcFundingPayment,
  GrpcFundingRate,
  FundingPayment,
  FundingRate,
  ExpiryFuturesMarketInfo,
  GrpcBinaryOptionsMarketInfo,
  BinaryOptionsMarket,
  GrpcDerivativeOrderHistory,
  DerivativeOrderHistory,
} from '../types/derivatives'
import {
  GrpcPriceLevel,
  Orderbook,
  PriceLevel,
  GrpcTokenMeta,
  IndexerTokenMeta,
  OrderbookWithSequence,
} from '../types/exchange'
import {
  FundingPaymentsResponse,
  FundingRatesResponse,
  MarketsResponse as DerivativeMarketsResponse,
  MarketResponse as DerivativeMarketResponse,
  OrderbookResponse as DerivativeOrderbookResponse,
  OrdersResponse as DerivativeOrdersResponse,
  OrdersHistoryResponse as DerivativeOrdersHistoryResponse,
  TradesResponse as DerivativeTradesResponse,
  PositionsResponse as DerivativePositionsResponse,
  OrderbooksResponse as DerivativeOrderbooksResponse,
  OrderbooksV2Response as DerivativeOrderbooksV2Response,
  OrderbookV2Response as DerivativeOrderbookV2Response,
  SubaccountTradesListResponse as DerivativeSubaccountTradesListResponse,
} from '@injectivelabs/indexer-proto-ts/injective_derivative_exchange_rpc'
import {
  BinaryOptionsMarketsResponse as BinaryOptionsMarketsResponse,
  BinaryOptionsMarketResponse as BinaryOptionsMarketResponse,
} from '@injectivelabs/indexer-proto-ts/injective_derivative_exchange_rpc'
import { grpcPagingToPaging } from '../../../utils/pagination'

const zeroPositionDelta = () => ({
  tradeDirection: TradeDirection.Buy,
  executionPrice: '0',
  executionQuantity: '0',
  executionMargin: '0',
})

/**
 * @category Indexer Grpc Transformer
 */
export class IndexerGrpcDerivativeTransformer {
  static grpcTokenMetaToTokenMeta(
    tokenMeta: GrpcTokenMeta | undefined,
  ): IndexerTokenMeta | undefined {
    if (!tokenMeta) {
      return
    }

    return {
      name: tokenMeta.name,
      address: tokenMeta.address,
      symbol: tokenMeta.symbol,
      logo: tokenMeta.logo,
      decimals: tokenMeta.decimals,
      updatedAt: tokenMeta.updatedAt,
      coinGeckoId: '',
    }
  }

  static grpcPerpetualMarketInfoToPerpetualMarketInfo(
    perpetualMarketInfo: GrpcPerpetualMarketInfo | undefined,
  ): PerpetualMarketInfo | undefined {
    if (!perpetualMarketInfo) {
      return
    }

    return {
      hourlyFundingRateCap: perpetualMarketInfo.hourlyFundingRateCap,
      hourlyInterestRate: perpetualMarketInfo.hourlyInterestRate,
      nextFundingTimestamp: parseInt(
        perpetualMarketInfo.nextFundingTimestamp,
        10,
      ),
      fundingInterval: parseInt(perpetualMarketInfo.fundingInterval, 10),
    }
  }

  static grpcPerpetualMarketFundingToPerpetualMarketFunding(
    perpetualMarketFunding: GrpcPerpetualMarketFunding | undefined,
  ): PerpetualMarketFunding | undefined {
    if (!perpetualMarketFunding) {
      return
    }

    return {
      cumulativeFunding: perpetualMarketFunding.cumulativeFunding,
      cumulativePrice: perpetualMarketFunding.cumulativePrice,
      lastTimestamp: parseInt(perpetualMarketFunding.lastTimestamp, 10),
    }
  }

  static grpcExpiryFuturesMarketInfoToExpiryFuturesMarketInfo(
    expiryFuturesMarketInfo: GrpcExpiryFuturesMarketInfo | undefined,
  ): ExpiryFuturesMarketInfo | undefined {
    if (!expiryFuturesMarketInfo) {
      return
    }

    return {
      expirationTimestamp: parseInt(
        expiryFuturesMarketInfo.expirationTimestamp,
        10,
      ),
      settlementPrice: expiryFuturesMarketInfo.settlementPrice,
    }
  }

  static marketResponseToMarket(response: DerivativeMarketResponse) {
    const market = response.market!

    return IndexerGrpcDerivativeTransformer.grpcMarketToMarket(market)
  }

  static marketsResponseToMarkets(response: DerivativeMarketsResponse) {
    const markets = response.markets

    return IndexerGrpcDerivativeTransformer.grpcMarketsToMarkets(markets)
  }

  static ordersResponseToOrders(response: DerivativeOrdersResponse) {
    const orders = response.orders
    const pagination = response.paging

    return {
      orders: IndexerGrpcDerivativeTransformer.grpcOrdersToOrders(orders),
      pagination: grpcPagingToPaging(pagination),
    }
  }

  static orderHistoryResponseToOrderHistory(
    response: DerivativeOrdersHistoryResponse,
  ) {
    const orderHistory = response.orders
    const pagination = response.paging

    return {
      orderHistory:
        IndexerGrpcDerivativeTransformer.grpcOrderHistoryListToOrderHistoryList(
          orderHistory,
        ),
      pagination: grpcPagingToPaging(pagination),
    }
  }

  static positionsResponseToPositions(response: DerivativePositionsResponse) {
    const positions = response.positions
    const pagination = response.paging

    return {
      positions:
        IndexerGrpcDerivativeTransformer.grpcPositionsToPositions(positions),
      pagination: grpcPagingToPaging(pagination),
    }
  }

  static tradesResponseToTrades(response: DerivativeTradesResponse) {
    const trades = response.trades
    const pagination = response.paging

    return {
      trades: IndexerGrpcDerivativeTransformer.grpcTradesToTrades(trades),
      pagination: grpcPagingToPaging(pagination),
    }
  }

  static subaccountTradesListResponseToSubaccountTradesList(
    response: DerivativeSubaccountTradesListResponse,
  ) {
    const tradesList = response.trades

    return IndexerGrpcDerivativeTransformer.grpcTradesToTrades(tradesList)
  }

  static fundingPaymentsResponseToFundingPayments(
    response: FundingPaymentsResponse,
  ) {
    const fundingPayments = response.payments
    const pagination = response.paging

    return {
      fundingPayments:
        IndexerGrpcDerivativeTransformer.grpcFundingPaymentsToFundingPayments(
          fundingPayments,
        ),
      pagination: grpcPagingToPaging(pagination),
    }
  }

  static fundingRatesResponseToFundingRates(response: FundingRatesResponse) {
    const fundingRates = response.fundingRates
    const pagination = response.paging

    return {
      fundingRates:
        IndexerGrpcDerivativeTransformer.grpcFundingRatesToFundingRates(
          fundingRates,
        ),
      pagination: grpcPagingToPaging(pagination),
    }
  }

  static orderbookResponseToOrderbook(response: DerivativeOrderbookResponse) {
    const orderbook = response.orderbook!

    return IndexerGrpcDerivativeTransformer.grpcOrderbookToOrderbook({
      buys: orderbook?.buys,
      sells: orderbook?.sells,
    })
  }

  static orderbookV2ResponseToOrderbookV2(
    response: DerivativeOrderbookV2Response,
  ) {
    const orderbook = response.getOrderbook()!

    return IndexerGrpcDerivativeTransformer.grpcOrderbookV2ToOrderbookV2({
      sequence: orderbook.getSequence(),
      buys: orderbook?.getBuysList(),
      sells: orderbook?.getSellsList(),
    })
  }

  static orderbooksResponseToOrderbooks(
    response: DerivativeOrderbooksResponse,
  ) {
    const orderbooks = response.orderbooks!

    return orderbooks.map((o) => {
      const orderbook = o.orderbook!

      return {
        marketId: o.marketId,
        orderbook: IndexerGrpcDerivativeTransformer.grpcOrderbookToOrderbook({
          buys: orderbook.buys,
          sells: orderbook.sells,
        }),
      }
    })
  }

  static orderbooksV2ResponseToOrderbooksV2(
    response: DerivativeOrderbooksV2Response,
  ) {
    const orderbooks = response.getOrderbooksList()!

    return orderbooks.map((o) => {
      const orderbook = o.getOrderbook()!

      return {
        marketId: o.getMarketId(),
        orderbook:
          IndexerGrpcDerivativeTransformer.grpcOrderbookV2ToOrderbookV2({
            sequence: orderbook.getSequence(),
            buys: orderbook.getBuysList(),
            sells: orderbook.getSellsList(),
          }),
      }
    })
  }

  static binaryOptionsMarketResponseToBinaryOptionsMarket(
    response: BinaryOptionsMarketResponse,
  ) {
    const market = response.market!

    return IndexerGrpcDerivativeTransformer.grpcBinaryOptionsMarketToBinaryOptionsMarket(
      market,
    )
  }

  static binaryOptionsMarketResponseWithPaginationToBinaryOptionsMarket(
    response: BinaryOptionsMarketsResponse,
  ) {
    const markets = response.markets
    const pagination = response.paging

    return {
      markets:
        IndexerGrpcDerivativeTransformer.grpcBinaryOptionsMarketsToBinaryOptionsMarkets(
          markets,
        ),
      pagination: grpcPagingToPaging(pagination),
    }
  }

  static binaryOptionsMarketsResponseToBinaryOptionsMarkets(
    response: BinaryOptionsMarketsResponse,
  ) {
    const markets = response.markets

    return IndexerGrpcDerivativeTransformer.grpcBinaryOptionsMarketsToBinaryOptionsMarkets(
      markets,
    )
  }

  static grpcBinaryOptionsMarketToBinaryOptionsMarket(
    market: GrpcBinaryOptionsMarketInfo,
  ): BinaryOptionsMarket {
    return {
      marketId: market.marketId,
      marketStatus: market.marketStatus,
      ticker: market.ticker,
      oracleSymbol: market.oracleSymbol,
      oracleProvider: market.oracleProvider,
      oracleType: market.oracleType,
      oracleScaleFactor: market.oracleScaleFactor,
      expirationTimestamp: parseInt(market.expirationTimestamp, 10),
      settlementTimestamp: parseInt(market.settlementTimestamp, 10),
      quoteDenom: market.quoteDenom,
      quoteToken: IndexerGrpcDerivativeTransformer.grpcTokenMetaToTokenMeta(
        market.quoteTokenMeta,
      ),
      makerFeeRate: market.makerFeeRate,
      takerFeeRate: market.takerFeeRate,
      serviceProviderFee: market.serviceProviderFee,
      minPriceTickSize: market.minPriceTickSize,
      minQuantityTickSize: market.minQuantityTickSize,
      settlementPrice: market.settlementPrice,
    }
  }

  static grpcBinaryOptionsMarketsToBinaryOptionsMarkets(
    markets: GrpcBinaryOptionsMarketInfo[],
  ): BinaryOptionsMarket[] {
    return markets.map(
      IndexerGrpcDerivativeTransformer.grpcBinaryOptionsMarketToBinaryOptionsMarket,
    )
  }

  static grpcMarketToMarket(
    market: GrpcDerivativeMarketInfo,
  ): DerivativeMarket {
    return {
      oracleBase: market.oracleBase,
      oracleQuote: market.oracleQuote,
      oracleType: market.oracleType,
      oracleScaleFactor: market.oracleScaleFactor,
      initialMarginRatio: market.initialMarginRatio,
      maintenanceMarginRatio: market.maintenanceMarginRatio,
      isPerpetual: market.isPerpetual,
      marketId: market.marketId,
      marketStatus: market.marketStatus,
      ticker: market.ticker,
      quoteDenom: market.quoteDenom,
      quoteToken: IndexerGrpcDerivativeTransformer.grpcTokenMetaToTokenMeta(
        market.quoteTokenMeta,
      ),
      makerFeeRate: market.makerFeeRate,
      takerFeeRate: market.takerFeeRate,
      serviceProviderFee: market.serviceProviderFee,
      minPriceTickSize: new BigNumber(market.minPriceTickSize).toNumber(),
      minQuantityTickSize: new BigNumber(market.minQuantityTickSize).toNumber(),
      perpetualMarketInfo:
        IndexerGrpcDerivativeTransformer.grpcPerpetualMarketInfoToPerpetualMarketInfo(
          market.perpetualMarketInfo,
        ),
      perpetualMarketFunding:
        IndexerGrpcDerivativeTransformer.grpcPerpetualMarketFundingToPerpetualMarketFunding(
          market.perpetualMarketFunding,
        ),
      expiryFuturesMarketInfo:
        IndexerGrpcDerivativeTransformer.grpcExpiryFuturesMarketInfoToExpiryFuturesMarketInfo(
          market.expiryFuturesMarketInfo,
        ),
    }
  }

  static grpcMarketsToMarkets(
    markets: GrpcDerivativeMarketInfo[],
  ): DerivativeMarket[] {
    return markets.map((market) =>
      IndexerGrpcDerivativeTransformer.grpcMarketToMarket(market),
    )
  }

  static grpcPositionDeltaToPositionDelta(
    positionDelta: GrpcPositionDelta,
  ): PositionDelta {
    return {
      tradeDirection: positionDelta.tradeDirection as TradeDirection,
      executionPrice: positionDelta.executionPrice,
      executionQuantity: positionDelta.executionQuantity,
      executionMargin: positionDelta.executionMargin,
    }
  }

  static grpcPriceLevelToPriceLevel(priceLevel: GrpcPriceLevel): PriceLevel {
    return {
      price: priceLevel.price,
      quantity: priceLevel.quantity,
      timestamp: parseInt(priceLevel.timestamp, 10),
    }
  }

  static grpcPriceLevelsToPriceLevels(
    priceLevels: GrpcPriceLevel[],
  ): PriceLevel[] {
    return priceLevels.map((priceLevel) =>
      IndexerGrpcDerivativeTransformer.grpcPriceLevelToPriceLevel(priceLevel),
    )
  }

  static grpcOrderbookToOrderbook({
    buys,
    sells,
  }: {
    buys: GrpcPriceLevel[]
    sells: GrpcPriceLevel[]
  }): Orderbook {
    return {
      buys: IndexerGrpcDerivativeTransformer.grpcPriceLevelsToPriceLevels(buys),
      sells:
        IndexerGrpcDerivativeTransformer.grpcPriceLevelsToPriceLevels(sells),
    }
  }

  static grpcOrderbookV2ToOrderbookV2({
    sequence,
    buys,
    sells,
  }: {
    sequence: number
    buys: GrpcPriceLevel[]
    sells: GrpcPriceLevel[]
  }): OrderbookWithSequence {
    return {
      sequence,
      buys: IndexerGrpcDerivativeTransformer.grpcPriceLevelsToPriceLevels(buys),
      sells:
        IndexerGrpcDerivativeTransformer.grpcPriceLevelsToPriceLevels(sells),
    }
  }

  static grpcOrderToOrder(
    order: GrpcDerivativeLimitOrder,
  ): DerivativeLimitOrder {
    return {
      orderHash: order.orderHash,
      orderSide: order.orderSide as DerivativeOrderSide,
      marketId: order.marketId,
      subaccountId: order.subaccountId,
      isReduceOnly: order.isReduceOnly,
      margin: order.margin,
      price: order.price,
      quantity: order.quantity,
      unfilledQuantity: order.unfilledQuantity,
      triggerPrice: order.triggerPrice,
      feeRecipient: order.feeRecipient,
      state: order.state as DerivativeOrderState,
      createdAt: parseInt(order.createdAt, 10),
      updatedAt: parseInt(order.updatedAt, 10),
      orderNumber: parseInt(order.orderNumber, 10),
      triggerAt: parseInt(order.triggerAt, 10),
      orderType: order.orderType,
      isConditional: order.isConditional,
      placedOrderHash: order.placedOrderHash,
      executionType: order.executionType,
    }
  }

  static grpcOrdersToOrders(
    orders: GrpcDerivativeLimitOrder[],
  ): DerivativeLimitOrder[] {
    return orders.map((order) =>
      IndexerGrpcDerivativeTransformer.grpcOrderToOrder(order),
    )
  }

  static grpcOrderHistoryToOrderHistory(
    orderHistory: GrpcDerivativeOrderHistory,
  ): DerivativeOrderHistory {
    return {
      orderHash: orderHistory.orderHash,
      marketId: orderHistory.marketId,
      isActive: orderHistory.isActive,
      subaccountId: orderHistory.subaccountId,
      executionType: orderHistory.executionType,
      orderType: orderHistory.orderType,
      price: orderHistory.price,
      triggerPrice: orderHistory.triggerPrice,
      quantity: orderHistory.quantity,
      filledQuantity: orderHistory.filledQuantity,
      state: orderHistory.state,
      createdAt: parseInt(orderHistory.createdAt, 10),
      updatedAt: parseInt(orderHistory.updatedAt, 10),
      triggerAt: parseInt(orderHistory.triggerAt, 10),
      isReduceOnly: orderHistory.isReduceOnly,
      direction: orderHistory.direction,
      isConditional: orderHistory.isConditional,
      placedOrderHash: orderHistory.placedOrderHash,
      margin: orderHistory.margin,
    }
  }

  static grpcOrderHistoryListToOrderHistoryList(
    orderHistory: GrpcDerivativeOrderHistory[],
  ): DerivativeOrderHistory[] {
    return orderHistory.map((orderHistory) =>
      IndexerGrpcDerivativeTransformer.grpcOrderHistoryToOrderHistory(
        orderHistory,
      ),
    )
  }

  static grpcPositionToPosition(position: GrpcDerivativePosition): Position {
    return {
      marketId: position.marketId,
      subaccountId: position.subaccountId,
      direction: position.direction as TradeDirection,
      quantity: position.quantity,
      entryPrice: position.entryPrice,
      margin: position.margin,
      aggregateReduceOnlyQuantity: position.aggregateReduceOnlyQuantity,
      liquidationPrice: position.liquidationPrice,
      markPrice: position.markPrice,
      ticker: position.ticker,
      updatedAt: parseInt(position.updatedAt, 10),
    }
  }

  static grpcPositionsToPositions(
    positions: GrpcDerivativePosition[],
  ): Position[] {
    return positions.map((position) =>
      IndexerGrpcDerivativeTransformer.grpcPositionToPosition(position),
    )
  }

  static grpcTradeToTrade(trade: GrpcDerivativeTrade): DerivativeTrade {
    const positionDelta = trade.positionDelta
    const mappedPositionDelta = positionDelta
      ? IndexerGrpcDerivativeTransformer.grpcPositionDeltaToPositionDelta(
          positionDelta,
        )
      : zeroPositionDelta()

    return {
      orderHash: trade.orderHash,
      tradeId: trade.tradeId,
      subaccountId: trade.subaccountId,
      marketId: trade.marketId,
      executedAt: parseInt(trade.executedAt, 10),
      tradeExecutionType: trade.tradeExecutionType as TradeExecutionType,
      executionSide: trade.executionSide as TradeExecutionSide,
      fee: trade.fee,
      feeRecipient: trade.feeRecipient,
      isLiquidation: trade.isLiquidation,
      payout: trade.payout,
      ...mappedPositionDelta,
    }
  }

  static grpcTradesToTrades(trades: GrpcDerivativeTrade[]): DerivativeTrade[] {
    return trades.map((trade) =>
      IndexerGrpcDerivativeTransformer.grpcTradeToTrade(trade),
    )
  }

  static grpcFundingPaymentToFundingPayment(
    fundingPayment: GrpcFundingPayment,
  ): FundingPayment {
    return {
      marketId: fundingPayment.marketId,
      subaccountId: fundingPayment.subaccountId,
      amount: fundingPayment.amount,
      timestamp: parseInt(fundingPayment.timestamp, 10),
    }
  }

  static grpcFundingPaymentsToFundingPayments(
    fundingPayments: GrpcFundingPayment[],
  ): FundingPayment[] {
    return fundingPayments.map(
      IndexerGrpcDerivativeTransformer.grpcFundingPaymentToFundingPayment,
    )
  }

  static grpcFundingRateToFundingRate(
    fundingRate: GrpcFundingRate,
  ): FundingRate {
    return {
      marketId: fundingRate.marketId,
      rate: fundingRate.rate,
      timestamp: parseInt(fundingRate.timestamp, 10),
    }
  }

  static grpcFundingRatesToFundingRates(
    fundingRates: GrpcFundingRate[],
  ): FundingRate[] {
    return fundingRates.map(
      IndexerGrpcDerivativeTransformer.grpcFundingRateToFundingRate,
    )
  }
}
