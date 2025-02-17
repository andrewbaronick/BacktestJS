import { simpleMovingAverage, exponentialMovingAverage } from 'indicatorts';

// Get SMA
export function indicatorSMA(candles: number[], length: number, limit: number = 1): number[] {
    const sma = simpleMovingAverage(candles, { period: length });
    if (limit >= sma.length) return sma
    if (limit === 1) return [sma[sma.length - 1]]
    else return sma.slice(sma.length - limit)
}

// Get EMA
export function indicatorEMA(candles: number[], length: number, limit: number = 1): number[] {
    const ema = exponentialMovingAverage(candles, { period: length });
    if (limit >= ema.length) return ema
    if (limit === 1) return [ema[ema.length - 1]]
    else return ema.slice(ema.length - limit)
}