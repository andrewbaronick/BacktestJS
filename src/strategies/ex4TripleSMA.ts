// Must Define Params: lowSMA, midSMA, highSMA

// Define imports
import { BTH } from "../infra/interfaces"
import { indicatorSMA } from "../indicators/moving-averages"

// Define globals
let position = ''
let timesBought = 0
let bonusBuy = false

// Example 4 Triple SMA Strategy
export async function ex4TripleSMA(bth: BTH) {
    // Get low, mid and high SMA from input
    const lowSMAInput = bth.params.lowSMA
    const midSMAInput = bth.params.midSMA
    const highSMAInput = bth.params.highSMA

    // Get last candles based on low, mid and high SMA
    const lowSMACandles = await bth.getCandles('close', 0, lowSMAInput)
    const midSMACandles = await bth.getCandles('close', 0, midSMAInput)
    const highSMACandles = await bth.getCandles('close', 0, highSMAInput)

    // Get low, mid and high SMA
    const lowSMA = indicatorSMA(lowSMACandles, lowSMAInput, 1)
    const midSMA = indicatorSMA(midSMACandles, midSMAInput, 1)
    const highSMA = indicatorSMA(highSMACandles, highSMAInput, 1)

    // Function to perfrom sell and define position
    async function sellLongShort() {
        await bth.sell()
        timesBought = 0
        bonusBuy = false
        position = lowSMA[0] > midSMA[0] && lowSMA[0] > highSMA[0] ? 'high' : lowSMA[0] < midSMA[0] && lowSMA[0] < highSMA[0] ? 'low' : 'mid'
    }

    // Sell Long Scenario
    if (bth.orderBook.boughtLong && (lowSMA[0] < midSMA[0] || lowSMA[0] < highSMA[0])) {
        if (timesBought === 1 && lowSMA[0] < midSMA[0] && lowSMA[0] < highSMA[0]) await sellLongShort()
        if (timesBought === 2) await sellLongShort()
    }

    // Sell Short Scenario
    else if (bth.orderBook.boughtShort && (lowSMA[0] > midSMA[0] || lowSMA[0] > highSMA[0])) {
        if (timesBought === 1 && lowSMA[0] > midSMA[0] && lowSMA[0] > highSMA[0]) await sellLongShort()
        if (timesBought === 2) await sellLongShort()
    }

    // Buy Long Scenarios
    if (position === 'low' && (lowSMA[0] > midSMA[0] || lowSMA[0] > highSMA[0])) {
        // Buy with 30% if low sma crosses mid or high sma from low position
        if (timesBought === 0) {
            await bth.buy({ amount: '30%' })
            timesBought++
        }

        // Buy with 25% if low sma crosses mid and high sma
        if (timesBought === 1 && lowSMA[0] > midSMA[0] && lowSMA[0] > highSMA[0]) {
            await bth.buy({ amount: bth.orderBook.preBoughtQuoteAmount * .25 })
            timesBought++
        }

        // Buy with 15% if mid sma crosses high sma
        if (!bonusBuy && midSMA[0] > highSMA[0]) {
            await bth.buy({ amount: bth.orderBook.preBoughtQuoteAmount * .15 })
            bonusBuy = true
        }
    }

    // Buy Short Scenarios
    else if (position === 'high' && (lowSMA[0] < midSMA[0] || lowSMA[0] < highSMA[0])) {
        // Buy with 30% if low sma crosses mid or high sma from high position
        if (timesBought === 0) {
            await bth.buy({ position: 'short', amount: '30%' })
            timesBought++
        }

        // Buy with 25% if low sma crosses mid and high sma
        if (timesBought === 1 && lowSMA[0] < midSMA[0] && lowSMA[0] < highSMA[0]) {
            await bth.buy({ position: 'short', amount: bth.orderBook.preBoughtQuoteAmount * .25 })
            timesBought++
        }

        // Buy with 15% if mid sma crosses high sma
        if (!bonusBuy && midSMA[0] < highSMA[0]) {
            await bth.buy({ position: 'short', amount: bth.orderBook.preBoughtQuoteAmount * .15 })
            bonusBuy = true
        }
    }

    // Update the position if not bought in
    if (!bth.orderBook.bought) {
        position = lowSMA[0] > midSMA[0] && lowSMA[0] > highSMA[0] ? 'high' : lowSMA[0] < midSMA[0] && lowSMA[0] < highSMA[0] ? 'low' : 'mid'
    }
}