// Must Define Params: lowSMA, highSMA

// Define imports
import { BTH } from "../infra/interfaces"
import { indicatorSMA } from "../indicators/moving-averages"

// Example 1 SMA Strategy with params
export async function ex1SMA(bth: BTH) {
    // Get low and high SMA from input
    const lowSMAInput = bth.params.lowSMA
    const highSMAInput = bth.params.highSMA

    // Get last candles based on low and high SMA
    const lowSMACandles = await bth.getCandles('close', 0, lowSMAInput) // If there are not lowSMA candles back will return array of 0's and block buy / sell until can return lowSMA candles
    const highSMACandles = await bth.getCandles('close', 0, highSMAInput) // If there are not highSMA candles back will return array of 0's and block buy / sell until can return highSMA candles

    // Get low and high SMA
    const lowSMA = await indicatorSMA(lowSMACandles, lowSMAInput)
    const highSMA = await indicatorSMA(highSMACandles, highSMAInput)

    // Buy if lowSMA crosses over the highSMA
    if (lowSMA > highSMA) {
        await bth.buy()
    }

    // Sell if lowSMA crosses under the highSMA
    else {
        await bth.sell()
    }
}