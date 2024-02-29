// ---------------------------------------------------- 
// |              MOVING AVERAGE INDICATORS           |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

const tulind = require('tulind')

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

// Get SMA
export async function indicatorSMA(candles: number[], length: number, limit?: number) {
    // Call SMA function from tulind with the candles and desired sma length
    const tulindReturn = await tulind.indicators.sma.indicator([candles], [length])

    // Tulind can return a few things, in this case the SMA data is in the first item in its return
    const sma = tulindReturn[0]
    if (limit === undefined) limit = 1

    // If you requested more SMA's then were generated return all that you have
    if (limit >= sma.length) return sma
    // Return the most recent SMA 
    if (limit === 1) return sma[sma.length - 1]
    // Return only a specific amount of SMA's
    else return sma.slice(sma.length - limit)
}

// Get EMA
export async function indicatorEMA(candles: number[], length: number, limit?: number) {
    const ema = (await tulind.indicators.ema.indicator([candles], [length]))[0]
    if (limit !== undefined) {
        if (limit >= ema.length) return ema
        if (limit === 1) return ema[ema.length - 1]
        else return ema.slice(ema.length - limit)
    }
    return ema
}