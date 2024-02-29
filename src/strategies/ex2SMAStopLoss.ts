// Must Define Params: lowSMA, highSMA, stopLoss

// Define imports
import { BTH } from "../infra/interfaces"
import { indicatorSMA } from "../indicators/moving-averages"

// Example 2 SMA Strategy with a stop loss
export async function ex2SMAStopLoss(bth: BTH) {
    // Get low / high SMA and the stop loss from input
    const lowSMAInput = bth.params.lowSMA
    const highSMAInput = bth.params.highSMA
    const stopLoss = bth.params.stopLoss

    // Get last candles based on low and high SMA
    const lowSMACandles = await bth.getCandles('close', 0, lowSMAInput)
    const highSMACandles = await bth.getCandles('close', 0, highSMAInput)

    // Get low and high SMA
    const lowSMA = await indicatorSMA(lowSMACandles, lowSMAInput)
    const highSMA = await indicatorSMA(highSMACandles, highSMAInput)

    // Buy if lowSMA crosses over the highSMA
    if (lowSMA > highSMA) {
        // Buy with a stop loss
        await bth.buy({ stopLoss: bth.currentCandle.close * (1 - (stopLoss / 100)) })
    }

    // Sell if lowSMA crosses under the highSMA
    else {
        await bth.sell()
    }
}