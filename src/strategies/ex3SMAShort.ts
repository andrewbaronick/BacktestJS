// Must Define Params: lowSMA, highSMA, stopLoss

// Define imports
import { BTH } from "../infra/interfaces"
import { indicatorSMA } from "../indicators/moving-averages"

// Example 2 SMA Strategy with short buys and a stop loss
export async function ex3SMAShort(bth: BTH) {
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

    // Buy long if lowSMA crosses over the highSMA
    if (lowSMA > highSMA) {
        // Sell if bought into a short
        if (bth.orderBook.boughtShort) await bth.sell()

        // Buy if not bought into a long
        if (!bth.orderBook.boughtLong) {
            // Buy with a stop loss
            await bth.buy({ stopLoss: bth.currentCandle.close * (1 - (stopLoss / 100)) })
        }
    }

    // Buy short if lowSMA crosses under the highSMA
    else {
        // Sell if bought into a long
        if (bth.orderBook.boughtLong) await bth.sell()

        // Buy if not bought into a short
        if (!bth.orderBook.boughtShort) {
            // Buy short with a stop loss
            await bth.buy({ position: 'short', stopLoss: bth.currentCandle.close * (1 + (stopLoss / 100)) })
        }
    }
}