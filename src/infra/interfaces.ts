// ---------------------------------------------------- 
// |                     INTERFACES                    |
// ---------------------------------------------------- 

export interface RunStrategy {
    strategyName: string
    historicalMetaData: string
    startingAmount: number
    startTime: number
    endTime: number
    params: LooseObject
    percentFee?: number
    percentSlippage?: number
}

export interface BuySell {
    price?: number
    position?: string
    amount?: number | string
    baseAmount?: number
    stopLoss?: number
    takeProfit?: number
}

export interface BuySellReal {
    currentClose: number
    price?: number
    position?: string
    amount?: number | string
    baseAmount?: number
    percentFee?: number
    percentSlippage?: number
    date: number
}

export interface GetCandles {
    symbol: string
    interval: string
    startTime?: number
    endTime?: number
    limit?: number
}

export interface UserQuestions {
    type: string
    message: string
    choices?: string[]
    dateDefault?: number
}

export interface Candle {
    openTime: number
    open: number
    high: number
    low: number
    close: number
    volume: number
    closeTime: number
    assetVolume: number
    numberOfTrades: number
}

export interface MetaCandle {
    name: string
    symbol: string
    interval: string
    base: string
    quote: string
    startTime: number
    endTime: number
    importedFromCSV: boolean
    creationTime: number
    lastUpdatedTime: number
}

export interface BTH {
    currentCandle: Candle
    getCandles: Function
    params: LooseObject
    orderBook: OrderBook
    buy: Function
    sell: Function
}

export interface OrderBook {
    bought: boolean
    boughtLong: boolean
    boughtShort: boolean
    baseAmount: number
    quoteAmount: number
    borrowedBaseAmount: number
    limitAmount: number
    preBoughtQuoteAmount: number
    stopLoss: number | string
    takeProfit: number | string
}

export interface ImportCSV {
    interval: string
    base: string
    quote: string
    path: string
}

export interface DataReturn {
    error: boolean
    data: string | LooseObject
}

export interface StrategyResult {
    name: string
    historicalDataName: string
    strategyName: string
    params: LooseObject
    startTime: number
    endTime: number
    startingAmount: number
    txFee: number
    slippage: number
    runMetaData: RunMetaData
    allOrders: Order[]
    allWorths: Worth[]
}

export interface GetStrategyResult extends StrategyResult {
    candleMetaData: MetaCandle
    candles: Candle[]
}

export interface StrategyResultMulti {
    name: string
    symbols: string[]
    permutationCount: number
    strategyName: string
    params: LooseObject
    startTime: number
    endTime: number
    startingAmount: number
    txFee: number
    slippage: number
    multiResults: LooseObject[]
    isMultiValue: boolean
    isMultiSymbol: boolean
}

export interface Order {
    type: string
    position: string
    price: number
    amount: number
    worth: number
    quoteAmount: number
    baseAmount: number
    borrowedBaseAmount: number
    profitAmount: number
    profitPercent: number
    time: number
}

export interface Worth {
    close: number
    high: number
    low: number
    open: number
    time: number
}

export interface RunMetaData {
    highestAmount: number
    highestAmountDate: number
    lowestAmount: number
    lowestAmountDate: number
    maxDrawdownAmount: number
    maxDrawdownAmountDates: string
    maxDrawdownPercent: number
    maxDrawdownPercentDates: string
    startingAssetAmount: number
    startingAssetAmountDate: number
    endingAssetAmount: number
    endingAssetAmountDate: number
    highestAssetAmount: number
    highestAssetAmountDate: number
    lowestAssetAmount: number
    lowestAssetAmountDate: number
    numberOfCandles: number
    numberOfCandlesInvested: number
    sharpeRatio: number
    id?: number
    strategyResultId?: number
}

export interface StrategyMeta {
    name: string
    params: string[]
    dynamicParams: boolean
    creationTime: number
    lastRunTime: number
}

export interface LooseObject {
    [key: string]: any
}