// ---------------------------------------------------- 
// |                   PARSE HELPERS                  |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define imports
import { Candle, Order, LooseObject, StrategyResult, MetaCandle, StrategyResultMulti } from "../infra/interfaces"
import { getCandleMetaData } from './prisma-historical-data'
const { Console } = require('console');
const { Transform } = require('stream');

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export function round(numberToConvert: number) {
    // If the number is greater than or equal to 1, round to two decimal places
    if (Math.abs(numberToConvert) >= 1) {
        return +numberToConvert.toFixed(2)
    }

    // If the number is less than 1
    else {
        let strNum = numberToConvert.toFixed(20)
        let i = 0

        // Find the first non-zero digit
        while (strNum[i + 2] === '0') {
            i++
        }

        // Extract and round the number up to three places after the first non-zero digit
        let rounded = parseFloat(strNum.slice(0, i + 2 + 3 + 1))

        // Convert the rounded number back to a string and truncate to the required number of decimal places
        const strRounded = rounded.toString()

        // Return the rounded number
        return +strRounded.slice(0, i + 2 + 3)
    }
}

export async function parseCandles(candles: Candle[]) {
    // Remove most recent candle
    candles.pop()

    // Map candles to an object
    const candleObjects: Candle[] = candles.map((item: LooseObject) => ({
        openTime: item[0],
        open: +item[1],
        high: +item[2],
        low: +item[3],
        close: +item[4],
        volume: +item[5],
        closeTime: item[6],
        assetVolume: +item[7],
        numberOfTrades: item[8]
    }))

    // Return candles
    return candleObjects
}

export async function parseHistoricalData(metaDatas: string[]) {
    // Define parsed meta candles
    let parsedMetaCandles: string[] = []

    // loop through all the historical metaData
    for (let i = 0; i < metaDatas.length; i++) {
        // Get a specific candles metaData
        const metaDataResults = await getCandleMetaData(metaDatas[i])

        if (typeof metaDataResults.data !== 'string') {
            // Define metaData
            const metaData = metaDataResults.data

            // Create item properly spaced out
            let item: string = ''
            if (metaData.symbol.length === 4) item = `|    ${metaData.symbol}    `
            if (metaData.symbol.length === 5) item = `|   ${metaData.symbol}    `
            if (metaData.symbol.length === 6) item = `|   ${metaData.symbol}   `
            if (metaData.symbol.length === 7) item = `|   ${metaData.symbol}  `
            if (metaData.symbol.length === 8) item = `|  ${metaData.symbol}  `
            if (metaData.symbol.length === 9) item = `|  ${metaData.symbol} `
            if (metaData.symbol.length === 10) item = `| ${metaData.symbol} `
            if (metaData.interval.length === 2) item += `|   ${metaData.interval}   `
            if (metaData.interval.length === 3) item += `|   ${metaData.interval}  `
            if (new Date(metaData.startTime).toLocaleString().length === 19) item += `|   ${new Date(metaData.startTime).toLocaleString()}    `
            if (new Date(metaData.startTime).toLocaleString().length === 20) item += `|   ${new Date(metaData.startTime).toLocaleString()}   `
            if (new Date(metaData.startTime).toLocaleString().length === 21) item += `|   ${new Date(metaData.startTime).toLocaleString()}  `
            if (new Date(metaData.startTime).toLocaleString().length === 22) item += `|  ${new Date(metaData.startTime).toLocaleString()}  `
            if (new Date(metaData.endTime).toLocaleString().length === 19) item += `|    ${new Date(metaData.endTime).toLocaleString()}   |`
            if (new Date(metaData.endTime).toLocaleString().length === 20) item += `|   ${new Date(metaData.endTime).toLocaleString()}   |`
            if (new Date(metaData.endTime).toLocaleString().length === 21) item += `|   ${new Date(metaData.endTime).toLocaleString()}  |`
            if (new Date(metaData.endTime).toLocaleString().length === 22) item += `|  ${new Date(metaData.endTime).toLocaleString()}  |`
            parsedMetaCandles.push(item)
        }
    }

    // Return all the parsed metaDatas
    return parsedMetaCandles
}

export async function removeUnusedCandles(candles: number[][], requiredTime: number) {
    // Remove unused candles that dont need to be saved to DB
    for (let i = 0; i < candles.length; i++) {
        if (candles[i][6] > requiredTime) return candles.splice(i)
    }
}

export async function findCandleIndex(candles: Candle[], startTime: number, endTime: number) {
    // Define indexes
    let gotStartIndex = false
    let indexes = { startIndex: 0, endIndex: 0 }

    // Loop through candles to find start and end times
    for (let i = 0; i < candles.length; i++) {
        if (!gotStartIndex && candles[i].closeTime >= startTime) {
            gotStartIndex = true
            indexes.startIndex = i
        }
        if (candles[i].closeTime >= endTime) {
            indexes.endIndex = i
            return indexes
        }
    }
    if (indexes.startIndex === 0) indexes.startIndex = startTime
    if (indexes.endIndex === 0) indexes.endIndex = endTime

    // Return the indexes
    return indexes
}

export function getDiffInDays(startDate: number, endDate: number) {
    // Define start and end times
    const startTime = new Date(startDate)
    const endTime = new Date(endDate)

    // Get diff in time
    const timeDiff = Math.abs(endTime.getTime() - startTime.getTime())

    // Parse diff in time
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60)
    const seconds = Math.floor((timeDiff / 1000) % 60)

    // Return the diff in time
    return `${days} days ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function getDiffInDaysPercentage(startDate: number, endDate: number, percentage: number) {
    // Define start and end times
    const startTime = new Date(startDate)
    const endTime = new Date(endDate)

    // Get diff in time
    const timeDiff = Math.abs(endTime.getTime() - startTime.getTime())

    // Reduce by percentage
    const timeDiffReduced = timeDiff * percentage

    // Parse diff in time
    const days = Math.floor(timeDiffReduced / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiffReduced / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((timeDiffReduced / (1000 * 60)) % 60)
    const seconds = Math.floor((timeDiffReduced / 1000) % 60)

    // Return the diff in time
    return `${days} days ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function parseRunResults(runResults: Order[]) {
    // Build statistic results
    const parsedRunResults = {
        winningTradeAmount: 0,
        losingTradeAmount: 0,
        averageWinAmount: 0,
        averageLossAmount: 0,
        buyAmount: 0,
        sellAmount: 0,
        averageBuyAmount: 0,
        averageSellAmount: 0,
        highestTradeWin: 0,
        highestTradeWinDate: '',
        highestTradeLoss: 0,
        highestTradeLossDate: '',
        highestBuyAmount: 0,
        highestBuyAmountDate: '',
        highestSellAmount: 0,
        highestSellAmountDate: '',
        lowestBuyAmount: 0,
        lowestBuyAmountDate: '',
        lowestSellAmount: 0,
        lowestSellAmountDate: '',
        averageTradePercent: 0,
        winRatePercent: 0,
        lossRatePercent: 0,
        averageWinPercent: 0,
        averageLossPercent: 0,
        highestTradeWinPercentage: 0,
        highestTradeWinPercentageDate: '',
        highestTradeLossPercentage: 0,
        highestTradeLossPercentageDate: '',
    }
    for (let i = 0; i < runResults.length; i++) {
        if (runResults[i].profitAmount > 0) {
            parsedRunResults.winningTradeAmount++
            parsedRunResults.averageWinAmount += runResults[i].profitAmount
            parsedRunResults.averageWinPercent += runResults[i].profitPercent
            if (runResults[i].profitPercent > parsedRunResults.highestTradeWinPercentage) {
                parsedRunResults.highestTradeWinPercentage = runResults[i].profitPercent
                parsedRunResults.highestTradeWinPercentageDate = new Date(runResults[i].time).toLocaleString()

            }
        }
        if (runResults[i].profitAmount < 0) {
            parsedRunResults.losingTradeAmount++
            parsedRunResults.averageLossAmount += runResults[i].profitAmount
            parsedRunResults.averageLossPercent += runResults[i].profitPercent
            if (parsedRunResults.highestTradeLossPercentage === 0) {
                parsedRunResults.highestTradeLossPercentage = runResults[i].profitPercent
                parsedRunResults.highestTradeLossPercentageDate = new Date(runResults[i].time).toLocaleString()
            }
            if (parsedRunResults.highestTradeLossPercentage !== 0 && runResults[i].profitPercent < parsedRunResults.highestTradeLossPercentage) {
                parsedRunResults.highestTradeLossPercentage = runResults[i].profitPercent
                parsedRunResults.highestTradeLossPercentageDate = new Date(runResults[i].time).toLocaleString()
            }
        }
        if (runResults[i].type === 'buy') {
            parsedRunResults.buyAmount++
            parsedRunResults.averageBuyAmount += runResults[i].amount
        }
        if (runResults[i].type === 'sell') {
            parsedRunResults.sellAmount++
            parsedRunResults.averageSellAmount += runResults[i].amount
        }

        if (runResults[i].profitAmount > parsedRunResults.highestTradeWin) {
            parsedRunResults.highestTradeWin = runResults[i].profitAmount
            parsedRunResults.highestTradeWinDate = new Date(runResults[i].time).toLocaleString()
        }
        if (parsedRunResults.highestTradeLoss === 0 && runResults[i].profitAmount < 0) {
            parsedRunResults.highestTradeLoss = runResults[i].profitAmount
            parsedRunResults.highestTradeLossDate = new Date(runResults[i].time).toLocaleString()
        }
        if (parsedRunResults.highestTradeLoss !== 0 && runResults[i].profitAmount < parsedRunResults.highestTradeLoss) {
            parsedRunResults.highestTradeLoss = runResults[i].profitAmount
            parsedRunResults.highestTradeLossDate = new Date(runResults[i].time).toLocaleString()
        }
        if (runResults[i].type === 'buy' && runResults[i].amount > parsedRunResults.highestBuyAmount) {
            parsedRunResults.highestBuyAmount = runResults[i].amount
            parsedRunResults.highestBuyAmountDate = new Date(runResults[i].time).toLocaleString()
        }
        if (runResults[i].type === 'sell' && runResults[i].amount > parsedRunResults.highestSellAmount) {
            parsedRunResults.highestSellAmount = runResults[i].amount
            parsedRunResults.highestSellAmountDate = new Date(runResults[i].time).toLocaleString()
        }
        if (parsedRunResults.lowestBuyAmount === 0 && runResults[i].type === 'buy' && runResults[i].amount !== 0) {
            parsedRunResults.lowestBuyAmount = runResults[i].amount
            parsedRunResults.lowestBuyAmountDate = new Date(runResults[i].time).toLocaleString()
        }
        if (parsedRunResults.lowestBuyAmount !== 0 && runResults[i].type === 'buy' && runResults[i].amount < parsedRunResults.lowestBuyAmount) {
            parsedRunResults.lowestBuyAmount = runResults[i].amount
            parsedRunResults.lowestBuyAmountDate = new Date(runResults[i].time).toLocaleString()
        }
        if (parsedRunResults.lowestSellAmount === 0 && runResults[i].type === 'sell' && runResults[i].amount !== 0) {
            parsedRunResults.lowestSellAmount = runResults[i].amount
            parsedRunResults.lowestSellAmountDate = new Date(runResults[i].time).toLocaleString()
        }
        if (parsedRunResults.lowestSellAmount !== 0 && runResults[i].type === 'sell' && runResults[i].amount < parsedRunResults.lowestSellAmount) {
            parsedRunResults.lowestSellAmount = runResults[i].amount
            parsedRunResults.lowestSellAmountDate = new Date(runResults[i].time).toLocaleString()
        }
    }

    parsedRunResults.averageWinAmount /= parsedRunResults.winningTradeAmount
    parsedRunResults.averageLossAmount /= parsedRunResults.losingTradeAmount
    parsedRunResults.averageBuyAmount /= parsedRunResults.buyAmount
    parsedRunResults.averageSellAmount /= parsedRunResults.sellAmount

    parsedRunResults.averageTradePercent = +((parsedRunResults.winningTradeAmount + parsedRunResults.losingTradeAmount) / (parsedRunResults.averageWinPercent + parsedRunResults.averageLossAmount) * 100).toFixed(2)
    parsedRunResults.winRatePercent = +(parsedRunResults.winningTradeAmount / (parsedRunResults.winningTradeAmount + parsedRunResults.losingTradeAmount) * 100).toFixed(2)
    parsedRunResults.lossRatePercent = +(parsedRunResults.losingTradeAmount / (parsedRunResults.winningTradeAmount + parsedRunResults.losingTradeAmount) * 100).toFixed(2)
    parsedRunResults.averageWinPercent /= parsedRunResults.winningTradeAmount
    parsedRunResults.averageLossPercent /= parsedRunResults.losingTradeAmount

    // Return statistic results
    return parsedRunResults
}

export async function parseRunResultsStats(runResultsParams: StrategyResult) {
    // Parse the run results
    const runResultStats = parseRunResults(runResultsParams.allOrders)

    // Define start and end times
    const startingDate = new Date(runResultsParams.startTime).toLocaleString()
    const endingDate = new Date(runResultsParams.endTime).toLocaleString()

    // Get candle metadata
    const metaDataResults = await getCandleMetaData(runResultsParams.historicalDataName)
    let historicalMetaData: MetaCandle
    if (metaDataResults.error) return { error: true, data: 'Failed to get candle metaData check that the candle still exists' }
    if (typeof metaDataResults.data !== 'string') {
        historicalMetaData = metaDataResults.data
    } else return { error: true, data: 'Failed to get candle metaData check that the candle still exists' }

    // Get diff in days of candles invested
    const diffInDaysCandlesInvestedPercentage = (runResultsParams.runMetaData.numberOfCandlesInvested / runResultsParams.runMetaData.numberOfCandles) * 100
    const diffInDaysCandlesInvested = getDiffInDaysPercentage(runResultsParams.startTime, runResultsParams.endTime, diffInDaysCandlesInvestedPercentage / 100)

    // Create total amounts
    const totals = [
        {
            name: `Start ${historicalMetaData.quote} Amount`,
            amount: runResultsParams.startingAmount,
            percent: 'na',
            date: startingDate
        },
        {
            name: `End ${historicalMetaData.quote} Amount`,
            amount: runResultsParams.allOrders[runResultsParams.allOrders.length - 1].worth,
            percent: `${+-(((runResultsParams.startingAmount - runResultsParams.allOrders[runResultsParams.allOrders.length - 1].worth) / runResultsParams.startingAmount) * 100).toFixed(2)}%`,
            date: endingDate
        },
        {
            name: `${runResultsParams.startingAmount < runResultsParams.allOrders[runResultsParams.allOrders.length - 1].worth ? 'Won' : 'Loss'} ${historicalMetaData.quote} Amount`,
            amount: runResultsParams.startingAmount < runResultsParams.allOrders[runResultsParams.allOrders.length - 1].worth ? round(runResultsParams.allOrders[runResultsParams.allOrders.length - 1].worth - runResultsParams.startingAmount) : round(runResultsParams.startingAmount - runResultsParams.allOrders[runResultsParams.allOrders.length - 1].worth),
            percent: `${-(((runResultsParams.startingAmount - runResultsParams.allOrders[runResultsParams.allOrders.length - 1].worth) / runResultsParams.startingAmount) * 100).toFixed(2)}%`,
            date: `Duration: ${getDiffInDays(runResultsParams.startTime, runResultsParams.endTime)}`
        },
        {
            name: 'Sharpe Ratio',
            amount: runResultsParams.runMetaData.sharpeRatio === 10000 ? 'Need > 1 Year' : runResultsParams.runMetaData.sharpeRatio,
            percent: "na",
            date: `Duration: ${getDiffInDays(runResultsParams.startTime, runResultsParams.endTime)}`
        },
        {
            name: `Highest ${historicalMetaData.quote} Amount`,
            amount: runResultsParams.runMetaData.highestAmount,
            percent: `${-(((runResultsParams.startingAmount - runResultsParams.runMetaData.highestAmount) / runResultsParams.startingAmount) * 100).toFixed(2)}%`,
            date: new Date(runResultsParams.runMetaData.highestAmountDate).toLocaleString()
        },
        {
            name: `Lowest ${historicalMetaData.quote} Amount`,
            amount: runResultsParams.runMetaData.lowestAmount,
            percent: `${-(((runResultsParams.startingAmount - runResultsParams.runMetaData.lowestAmount) / runResultsParams.startingAmount) * 100).toFixed(2)}%`,
            date: new Date(runResultsParams.runMetaData.lowestAmountDate).toLocaleString()
        },
        {
            name: 'Max Drawdown Amount',
            amount: runResultsParams.runMetaData.maxDrawdownAmount,
            percent: 'na',
            date: runResultsParams.runMetaData.maxDrawdownAmountDates
        },
        {
            name: 'Max Drawdown %',
            amount: 'na',
            percent: `${+-runResultsParams.runMetaData.maxDrawdownPercent}%`,
            date: runResultsParams.runMetaData.maxDrawdownPercentDates
        },
        {
            name: 'Number Of Candles',
            amount: runResultsParams.runMetaData.numberOfCandles,
            percent: 'na',
            date: `Duration: ${getDiffInDays(runResultsParams.startTime, runResultsParams.endTime)}`
        },
        {
            name: 'Number Of Candles Invested',
            amount: runResultsParams.runMetaData.numberOfCandlesInvested,
            percent: `${diffInDaysCandlesInvestedPercentage.toFixed(2)}%`,
            date: `Duration: ${diffInDaysCandlesInvested}`
        }
    ]

    // Create trade win / loss amounts and percentages
    const trades = [
        {
            name: 'Amount Of Winning Trades',
            amount: runResultStats.winningTradeAmount,
            percent: `${runResultStats.winRatePercent}%`,
            date: 'na'
        },
        {
            name: 'Amount Of Losing Trades',
            amount: runResultStats.losingTradeAmount,
            percent: `${runResultStats.lossRatePercent}%`,
            date: 'na'
        },
        {
            name: 'Average Wins',
            amount: round(runResultStats.averageWinAmount),
            percent: `${runResultStats.averageWinPercent.toFixed(2)}%`,
            date: 'na'
        },
        {
            name: 'Average Losses',
            amount: round(runResultStats.averageLossAmount),
            percent: `${runResultStats.averageLossPercent.toFixed(2)}%`,
            date: 'na'
        },
        {
            name: 'Highest Trade Win Amount',
            amount: runResultStats.highestTradeWin,
            percent: 'na',
            date: runResultStats.highestTradeWinDate
        },
        {
            name: 'Highest Trade Win %',
            amount: 'na',
            percent: `${runResultStats.highestTradeWinPercentage}%`,
            date: runResultStats.highestTradeWinPercentageDate
        },
        {
            name: 'Highest Trade Loss Amount',
            amount: runResultStats.highestTradeLoss,
            percent: 'na',
            date: runResultStats.highestTradeLossDate
        },
        {
            name: 'Highest Trade Loss %',
            amount: 'na',
            percent: `${runResultStats.highestTradeLossPercentage}%`,
            date: runResultStats.highestTradeLossPercentageDate
        },
        {
            name: 'Average Trade Result %',
            amount: 'na',
            percent: `${runResultStats.averageTradePercent.toFixed(2)}%`,
            date: 'na'
        }
    ]

    // Create trade buy / sell amounts
    const tradeBuySellAmounts = [
        { name: 'Amount Of Buys', amount: runResultStats.buyAmount, date: 'na' },
        { name: 'Amount Of Sells', amount: runResultStats.sellAmount, date: 'na' },
        { name: 'Average Buy Amount', amount: round(runResultStats.averageBuyAmount), date: 'na' },
        { name: 'Average Sell Amount', amount: round(runResultStats.averageSellAmount), date: 'na' },
        { name: 'Highest Buy Amount', amount: runResultStats.highestBuyAmount, date: runResultStats.highestBuyAmountDate },
        { name: 'Highest Sell Amount', amount: runResultStats.highestSellAmount, date: runResultStats.highestSellAmountDate },
        { name: 'Lowest Buy Amount', amount: runResultStats.lowestBuyAmount, date: runResultStats.lowestBuyAmountDate },
        { name: 'Lowest Sell Amount', amount: runResultStats.lowestSellAmount, date: runResultStats.lowestSellAmountDate }
    ]

    // Create total asset amounts / percentages
    const assetAmountsPercentages = [
        {
            name: `Start ${historicalMetaData.base} Amount`,
            amount: runResultsParams.runMetaData.startingAssetAmount,
            percent: 'na',
            date: new Date(runResultsParams.runMetaData.startingAssetAmountDate).toLocaleString()
        },
        {
            name: `End ${historicalMetaData.base} Amount`,
            amount: runResultsParams.runMetaData.endingAssetAmount,
            percent: 'na',
            date: new Date(runResultsParams.runMetaData.endingAssetAmountDate).toLocaleString()
        },
        {
            name: `${historicalMetaData.base} ${runResultsParams.runMetaData.startingAssetAmount < runResultsParams.runMetaData.endingAssetAmount ? 'Went Up' : 'Went Down'}`,
            amount: runResultsParams.runMetaData.startingAssetAmount < runResultsParams.runMetaData.endingAssetAmount ? round(runResultsParams.runMetaData.endingAssetAmount - runResultsParams.runMetaData.startingAssetAmount) : round(runResultsParams.runMetaData.startingAssetAmount - runResultsParams.runMetaData.endingAssetAmount),
            percent: `${-(((runResultsParams.runMetaData.startingAssetAmount - runResultsParams.runMetaData.endingAssetAmount) / runResultsParams.runMetaData.startingAssetAmount) * 100).toFixed(2)}%`,
            date: `Duration: ${getDiffInDays(runResultsParams.runMetaData.startingAssetAmountDate, runResultsParams.runMetaData.endingAssetAmountDate)}`
        },
        {
            name: `${historicalMetaData.base} Highest`,
            amount: runResultsParams.runMetaData.highestAssetAmount,
            percent: `${-(((runResultsParams.runMetaData.startingAssetAmount - runResultsParams.runMetaData.highestAssetAmount) / runResultsParams.runMetaData.startingAssetAmount) * 100).toFixed(2)}%`,
            date: new Date(runResultsParams.runMetaData.highestAssetAmountDate).toLocaleString()
        },
        {
            name: `${historicalMetaData.base} Lowest`,
            amount: runResultsParams.runMetaData.lowestAssetAmount,
            percent: `${-(((runResultsParams.runMetaData.startingAssetAmount - runResultsParams.runMetaData.lowestAssetAmount) / runResultsParams.runMetaData.startingAssetAmount) * 100).toFixed(2)}%`,
            date: new Date(runResultsParams.runMetaData.lowestAssetAmountDate).toLocaleString()
        },
        {
            name: `${historicalMetaData.base} Lowest To Highest`,
            amount: runResultsParams.runMetaData.highestAssetAmount - runResultsParams.runMetaData.lowestAssetAmount,
            percent: `${-(((runResultsParams.runMetaData.lowestAssetAmount - runResultsParams.runMetaData.highestAssetAmount) / runResultsParams.runMetaData.lowestAssetAmount) * 100).toFixed(2)}%`,
            date: `Duration: ${getDiffInDays(
                runResultsParams.runMetaData.highestAssetAmountDate < runResultsParams.runMetaData.lowestAssetAmountDate ? runResultsParams.runMetaData.highestAssetAmountDate : runResultsParams.runMetaData.lowestAssetAmountDate,
                runResultsParams.runMetaData.highestAssetAmountDate < runResultsParams.runMetaData.lowestAssetAmountDate ? runResultsParams.runMetaData.lowestAssetAmountDate : runResultsParams.runMetaData.highestAssetAmountDate,
            )}`
        }
    ]

    // Create param objects
    let paramsArray = Object.entries(runResultsParams.params).map(([key, value]) => ({ name: key, value: value }))

    // Create table for general data
    const generalData = [
        { name: 'Strategy Name', value: runResultsParams.strategyName },
        { name: 'Symbol', value: historicalMetaData.symbol },
        { name: 'Base', value: historicalMetaData.base },
        { name: 'Quote', value: historicalMetaData.quote },
        { name: 'Interval', value: historicalMetaData.interval },
        { name: 'TX Fee', value: runResultsParams.txFee },
        { name: 'Slippage', value: runResultsParams.slippage }
    ]

    // Push params array into the general data
    generalData.splice(1, 0, ...paramsArray)

    // Return all the statistical results
    return { error: false, data: { totals, assetAmountsPercentages, trades, tradeBuySellAmounts, generalData } }
}

export async function parseRunResultsStatsMulti(runResultsParams: StrategyResultMulti) {
    // Get candle metadata
    const metaDataResults = await getCandleMetaData(runResultsParams.symbols[0])
    let historicalMetaData: MetaCandle
    if (metaDataResults.error) return { error: true, data: 'Failed to get candle metaData check that the candle still exists' }
    if (typeof metaDataResults.data !== 'string') {
        historicalMetaData = metaDataResults.data
    } else return { error: true, data: 'Failed to get candle metaData check that the candle still exists' }

    const multiSymbol = runResultsParams.isMultiSymbol
    const quoteName = multiSymbol ? '' : historicalMetaData.quote
    const assetAmounts = runResultsParams.multiResults[0].assetAmounts

    const totalDuration = `Duration: ${getDiffInDays(runResultsParams.startTime, runResultsParams.endTime)}`

    // Calculate the highest maxDrawdownAmount
    const highestDrawdownAmount = Math.max(
        ...runResultsParams.multiResults.map((obj) => obj.maxDrawdownAmount)
    );

    // Calculate the highest maxDrawdownPercent
    const highestDrawdownPercent = Math.max(
        ...runResultsParams.multiResults.map((obj) => obj.maxDrawdownPercent)
    );

    // Calculate the lowest maxDrawdownAmount
    const lowestDrawdownAmount = Math.min(
        ...runResultsParams.multiResults.map((obj) => obj.maxDrawdownAmount)
    );

    // Calculate the lowest maxDrawdownPercent
    const lowestDrawdownPercent = Math.min(
        ...runResultsParams.multiResults.map((obj) => obj.maxDrawdownPercent)
    );

    // Calculate the average drawdown amount
    const totalDrawdownAmount = runResultsParams.multiResults.reduce(
        (acc, obj) => acc + obj.maxDrawdownAmount,
        0
    );
    const averageDrawdownAmount = (totalDrawdownAmount / runResultsParams.multiResults.length).toFixed(2);

    // Calculate the average drawdown percent
    const totalDrawdownPercent = runResultsParams.multiResults.reduce(
        (acc, obj) => acc + obj.maxDrawdownPercent,
        0
    );
    const averageDrawdownPercent = (totalDrawdownPercent / runResultsParams.multiResults.length).toFixed(2);

    // Calculate the average endAmount
    const totalEndAmount = runResultsParams.multiResults.reduce(
        (acc, obj) => acc + obj.endAmount,
        0
    );
    const averageEndAmount = +((totalEndAmount / runResultsParams.multiResults.length).toFixed(2));

    // Calculate the highest endAmount
    const highestEndAmount = Math.max(
        ...runResultsParams.multiResults.map((obj) => obj.endAmount)
    );

    // Calculate the lowest endAmount
    const lowestEndAmount = Math.min(
        ...runResultsParams.multiResults.map((obj) => obj.endAmount)
    );

    // Create total amounts
    const totals = [
        {
            name: `Start ${quoteName} Amount`,
            amount: runResultsParams.startingAmount,
            percent: 'na',
            date: multiSymbol ? 'na' : new Date(runResultsParams.startTime).toLocaleString()
        },
        {
            name: 'Number Of Candles',
            amount: multiSymbol ? 'na' : assetAmounts.numberOfCandles,
            percent: 'na',
            date: multiSymbol ? 'na' : totalDuration
        },
        {
            name: `Average Ending ${quoteName} Amount`,
            amount: averageEndAmount,
            percent: `${-(((runResultsParams.startingAmount - averageEndAmount) / runResultsParams.startingAmount) * 100).toFixed(2)}%`,
            date: multiSymbol ? 'na' : totalDuration
        },
        {
            name: `Highest Ending ${quoteName} Amount`,
            amount: highestEndAmount,
            percent: `${-(((runResultsParams.startingAmount - highestEndAmount) / runResultsParams.startingAmount) * 100).toFixed(2)}%`,
            date: multiSymbol ? 'na' : totalDuration
        },
        {
            name: `Lowest Ending ${quoteName} Amount`,
            amount: lowestEndAmount,
            percent: `${-(((runResultsParams.startingAmount - lowestEndAmount) / runResultsParams.startingAmount) * 100).toFixed(2)}%`,
            date: multiSymbol ? 'na' : totalDuration
        },
        {
            name: 'Average Drawdown',
            amount: averageDrawdownAmount,
            percent: `${averageDrawdownPercent}%`,
            date: multiSymbol ? 'na' : totalDuration
        },
        {
            name: 'Highest Drawdown',
            amount: highestDrawdownAmount,
            percent: `${highestDrawdownPercent}%`,
            date: multiSymbol ? 'na' : totalDuration
        },
        {
            name: 'Lowest Drawdown',
            amount: lowestDrawdownAmount,
            percent: `${lowestDrawdownPercent.toFixed(2)}%`,
            date: multiSymbol ? 'na' : totalDuration
        }
    ]

    // Create total asset amounts / percentages
    const assetAmountsPercentages = [
        {
            name: `Start ${historicalMetaData.base} Amount`,
            amount: assetAmounts.startingAssetAmount,
            percent: 'na',
            date: new Date(runResultsParams.startTime).toLocaleString()
        },
        {
            name: `End ${historicalMetaData.base} Amount`,
            amount: assetAmounts.endingAssetAmount,
            percent: 'na',
            date: new Date(runResultsParams.endTime).toLocaleString()
        },
        {
            name: `${historicalMetaData.base} ${assetAmounts.startingAssetAmount < assetAmounts.endingAssetAmount ? 'Went Up' : 'Went Down'}`,
            amount: assetAmounts.startingAssetAmount < assetAmounts.endingAssetAmount ?
                round(assetAmounts.endingAssetAmount - assetAmounts.startingAssetAmount) :
                round(assetAmounts.startingAssetAmount - assetAmounts.endingAssetAmount),
            percent: `${-(((assetAmounts.startingAssetAmount - assetAmounts.endingAssetAmount) / assetAmounts.startingAssetAmount) * 100).toFixed(2)}%`,
            date: totalDuration
        },
        {
            name: `${historicalMetaData.base} Highest`,
            amount: assetAmounts.highestAssetAmount,
            percent: `${-(((assetAmounts.startingAssetAmount - assetAmounts.highestAssetAmount) / assetAmounts.startingAssetAmount) * 100).toFixed(2)}%`,
            date: new Date(assetAmounts.highestAssetAmountDate).toLocaleString()
        },
        {
            name: `${historicalMetaData.base} Lowest`,
            amount: assetAmounts.lowestAssetAmount,
            percent: `${-(((assetAmounts.startingAssetAmount - assetAmounts.lowestAssetAmount) / assetAmounts.startingAssetAmount) * 100).toFixed(2)}%`,
            date: new Date(assetAmounts.lowestAssetAmountDate).toLocaleString()
        },
        {
            name: `${historicalMetaData.base} Lowest To Highest`,
            amount: assetAmounts.highestAssetAmount - assetAmounts.lowestAssetAmount,
            percent: `${-(((assetAmounts.lowestAssetAmount - assetAmounts.highestAssetAmount) / assetAmounts.lowestAssetAmount) * 100).toFixed(2)}%`,
            date: `Duration: ${getDiffInDays(
                assetAmounts.highestAssetAmountDate < assetAmounts.lowestAssetAmountDate ? assetAmounts.highestAssetAmountDate : assetAmounts.lowestAssetAmountDate,
                assetAmounts.highestAssetAmountDate < assetAmounts.lowestAssetAmountDate ? assetAmounts.lowestAssetAmountDate : assetAmounts.highestAssetAmountDate,
            )}`
        }
    ]

    // Create param objects
    let paramsArray = Object.entries(runResultsParams.params).map(([key, value]) => ({ name: key, value: value }))

    // Create table for general data
    let generalData
    if (multiSymbol) {
        generalData = [
            { name: 'Strategy Name', value: runResultsParams.strategyName },
            { name: 'Permutation Count', value: runResultsParams.permutationCount },
            { name: 'Symbols', value: runResultsParams.symbols },
            { name: 'Interval', value: historicalMetaData.interval },
            { name: 'TX Fee', value: runResultsParams.txFee },
            { name: 'Slippage', value: runResultsParams.slippage }
        ]
    } else {
        generalData = [
            { name: 'Strategy Name', value: runResultsParams.strategyName },
            { name: 'Permutation Count', value: runResultsParams.permutationCount },
            { name: 'Symbol', value: historicalMetaData.symbol },
            { name: 'Base', value: historicalMetaData.base },
            { name: 'Quote', value: historicalMetaData.quote },
            { name: 'Interval', value: historicalMetaData.interval },
            { name: 'TX Fee', value: runResultsParams.txFee },
            { name: 'Slippage', value: runResultsParams.slippage }
        ]
    }

    // Push params array into the general data
    generalData.splice(1, 0, ...paramsArray)

    // Return all the statistical results
    return { error: false, data: { totals, assetAmountsPercentages, generalData } }
}

export function generatePermutations(params: LooseObject): any[] {
    // Convert the string values to arrays of numbers
    const processedParams: { [key: string]: number[] } = {}
    for (const key in params) {
        processedParams[key] = params[key].split(',').map(Number)
    }

    // Helper function to generate all combinations
    function* cartesianProduct(arrays: number[][], index = 0): Generator<number[], void, unknown> {
        if (index === arrays.length) {
            yield []
            return
        }

        for (const value of arrays[index]) {
            for (const rest of cartesianProduct(arrays, index + 1)) {
                yield [value, ...rest]
            }
        }
    }

    // Generate all combinations
    const keys = Object.keys(processedParams)
    const values = Object.values(processedParams)
    const permutations = []

    for (const combination of cartesianProduct(values)) {
        const permutation: any = {}
        keys.forEach((key, idx) => {
            permutation[key] = combination[idx]
        })
        permutations.push(permutation)
    }

    return permutations
}

export function removeIndexFromTable(data: LooseObject[]) {
    const ts = new Transform({ transform(chunk: any, enc: any, cb: any) { cb(null, chunk) } })
    const logger = new Console({ stdout: ts })
    logger.table(data)
    const table = (ts.read() || '').toString()
    let result = '';
    for (let row of table.split(/[\r\n]+/)) {
        let r = row.replace(/[^┬]*┬/, '┌');
        r = r.replace(/^├─*┼/, '├');
        r = r.replace(/│[^│]*/, '');
        r = r.replace(/^└─*┴/, '└');
        r = r.replace(/'/g, ' ');
        result += `${r}\n`;
    }
    console.log(result);
}

export function parseMultiResults(data: LooseObject[], numberOfCandles: number, startingAmount: number, multiSymbol: boolean) {
    // Sort by best returns
    data.sort((a: LooseObject, b: LooseObject) => b.endAmount - a.endAmount);

    // Clean the multi results and sort by best returns
    data = data.map((item) => {
        const { maxDrawdownAmount, maxDrawdownPercent, numberOfCandlesInvested, endAmount, assetAmounts, sharpeRatio, symbol, interval, ...rest } = item;
        const maxDrawdown = `${maxDrawdownPercent}% : ${maxDrawdownAmount}`;

        const endAmountUpdated = `${((item.endAmount / startingAmount) * 100).toFixed(2)}% : ${item.endAmount}`;
        const numberOfCandlesInvestedUpdated = `${((item.numberOfCandlesInvested / numberOfCandles) * 100).toFixed(2)}% : ${item.numberOfCandlesInvested} out of ${numberOfCandles}`;
        const sharpeRatioUpdated = sharpeRatio === 10000 ? 'Need > 1 Year' : sharpeRatio
        const returnData = {
            ...rest,
            endAmountUpdated,
            sharpeRatioUpdated,
            maxDrawdown,
            numberOfCandlesInvested: numberOfCandlesInvestedUpdated,
        };

        return multiSymbol ? {symbol, interval, ...returnData} : returnData
    })

    return data
}

export function calculateSharpeRatio(entries: LooseObject, riskFreeRateAnnual = 0.02) {
    if (entries.length < 2) {
        return 10000; // Not enough data
    }

    // Convert the first two timestamps to Date objects and calculate the interval in days
    const intervalMs = new Date(entries[1].time).getTime() - new Date(entries[0].time).getTime();
    const intervalDays = intervalMs / (24 * 60 * 60 * 1000);

    // Calculate the number of intervals in one year
    const intervalsPerYear = 365.25 / intervalDays;

    const startTime = new Date(entries[0].time).getTime();
    const endTime = new Date(entries[entries.length - 1].time).getTime();

    // Ensure data covers at least one year
    if (endTime - startTime < 365.25 * 24 * 60 * 60 * 1000) {
        return 10000; // Not covering at least one year
    }

    let returns = [];
    for (let i = 1; i < entries.length; i++) {
        const returnVal = (entries[i].close - entries[i - 1].close) / entries[i - 1].close;
        returns.push(returnVal);
    }

    // Convert the annual risk-free rate to the equivalent rate for the interval
    const riskFreeRateInterval = Math.pow(1 + riskFreeRateAnnual, intervalDays / 365.25) - 1;

    let excessReturns = returns.map(r => r - riskFreeRateInterval);
    const averageExcessReturn = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
    const stdDevExcessReturn = Math.sqrt(excessReturns.reduce((sum, r) => sum + Math.pow(r - averageExcessReturn, 2), 0) / (excessReturns.length - 1));

    // Calculate Sharpe Ratio, annualized based on the interval
    return (averageExcessReturn / stdDevExcessReturn) * Math.sqrt(intervalsPerYear);
}