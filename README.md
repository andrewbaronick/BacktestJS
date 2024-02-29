# BacktestJS
![GitHub](https://img.shields.io/github/license/andrewbaronick/BacktestJS) 
![GitHub package.json version](https://img.shields.io/github/package-json/v/andrewbaronick/BacktestJS) 
![GitHub commit activity](https://img.shields.io/github/commit-activity/y/andrewbaronick/BacktestJS) 
![GitHub contributors](https://img.shields.io/github/contributors/andrewbaronick/BacktestJS) 
![GitHub last commit](https://img.shields.io/github/last-commit/andrewbaronick/BacktestJS) 
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/bandrewbaronick/BacktestJS) 
![GitHub package.json dynamic](https://img.shields.io/github/package-json/author/andrewbaronick/BacktestJS)
[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fandrewbaronick%2FBacktestJS%2Fhit-counter&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=Views&edge_flat=false)](https://hits.seeyoufarm.com)

## Description
Powerful infrastructure to backtest trading strategies with Typescript or Javascript!
- The app is a CLI based tool
- Includes logic to download candle data from binance or import from csv
- Includes a sqllite database to store candle data, strategies and strategy results
- Complete documentation below on how to use the app

## Install Requirements
BacktestJS requires [NodeJS](https://nodejs.org/en/download) on your machine.
## Setup Environment
```bash
  git clone https://github.com/andrewbaronick/BacktestJS.git
  cd BacktestJS
  npm i
```

## Run BacktestJS

```bash
  npm start
```

## [Documentation](backtestjs.com)
BacktestJS has a website with [Full Documentation](backtestjs.com), videos, examples as well as a complete community to ask questions if needed.  It is highly suggested to visit this site.

## Download / Import Historical Candle Data
BacktestJS can be used to download candle data from Binance or import candle data from a csv to be used when running strategies very conventientally throught the CLI (no coding needed!)

If wanted you can also export any of the saved data to a csv through the CLI (no coding needed!)

## Example

#### No Params

Below is an example of a simple 3 over 45 SMA strategy.  You buy once the 3 crosses the 45 and sell if not.  In this example we dont use the power of params.
```bash
import { BTH } from "../infra/interfaces"
import { indicatorSMA } from "../indicators/moving-averages"

export async function sma(bth: BTH) {
    // Get Candles
    const lowSMACandles = await bth.getCandles('close', 0, 3)
    const highSMACandles = await bth.getCandles('close', 0, 45)

    // Get SMA's
    const lowSMA = await indicatorSMA(lowSMACandles, 3, 1)
    const highSMA = await indicatorSMA(highSMACandles, 45, 1)

    // Perform Buy / Sell when low crosses high
    if (lowSMA > highSMA) {
        await bth.buy()
    } else {
        await bth.sell()
    }
}
```

#### With Params
Below is an example of a simple SMA strategy like above but its not hard coded to the 3 over 45. When you run the strategy through the CLI you will be asked to provide a low and high sma.  You can even provide multiple lows and multiple highs and all the variations will be tested in one shot.

```bash
import { BTH } from "../infra/interfaces"
import { indicatorSMA } from "../indicators/moving-averages"

export async function sma(bth: BTH) {
    // Get low and high SMA from input
    const lowSMAInput = bth.params.lowSMA
    const highSMAInput = bth.params.highSMA

    // Get Candles
    const lowSMACandles = await bth.getCandles('close', 0, lowSMAInput)
    const highSMACandles = await bth.getCandles('close', 0, highSMAInput)

    // Get SMA's
    const lowSMA = await indicatorSMA(lowSMACandles, lowSMAInput, 1)
    const highSMA = await indicatorSMA(highSMACandles, highSMAInput, 1)

    // Perform Buy / Sell when low crosses high
    if (lowSMA > highSMA) {
        await bth.buy()
    } else {
        await bth.sell()
    }
}
```

## Results

## Multi Value Results

## Multi Symbol Results

## Author

#### Andrew Baronick  

[Github](https://www.github.com/andrewbaronick)  
[LinkedIn](https://www.linkedin.com/in/andrew-baronick/)