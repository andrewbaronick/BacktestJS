<a href="https://github.com#gh-light-mode-only">
  <img src="http://backtestjs.com/wp-content/uploads/2024/02/BacktestJS-Black-Logo-1.png">
</a>
<a href="https://github.com#gh-dark-mode-only">
  <img src="http://backtestjs.com/wp-content/uploads/2024/02/BacktestJS-White-Logo-1.png">
</a>


![GitHub](https://img.shields.io/github/license/andrewbaronick/BacktestJS) 
![GitHub package.json version](https://img.shields.io/github/package-json/v/andrewbaronick/BacktestJS) 


[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fandrewbaronick%2FBacktestJS%2Fhit-counter&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=Views&edge_flat=false)](https://hits.seeyoufarm.com)

## 📜 Description
Elevate your trading strategies with BacktestJS, the premier CLI tool designed for traders and developers alike. Harness the power of Typescript or Javascript to backtest your strategies with precision, efficiency, and flexibility.

&nbsp;  
## 🌟 Key Features
- 🖥️ **Streamlined CLI Interface**: Intuitive command-line interface for streamlined operation.

- 📊 **Candle Data at Your Fingertips**: Download historical candle data directly from Binance or import your own from CSV files.

- 🗃️ **Seamless SQLite Integration**: Efficient storage for your candle data, strategies, and results (no coding required).

- 📚 **Extensive Documentation**: Unlock the full potential of BacktestJS with detailed guides and resources.

&nbsp;  
## 🚀 Quick Start
### 📦 Setup Environment
Install BacktestJS globally with npm to get started:
```bash
  git clone https://github.com/andrewbaronick/BacktestJS.git
  cd BacktestJS
  npm i
```

### 🌈 Launch BacktestJS
Enter the world of strategic backtesting with a single command:
```bash
  npm start
```

&nbsp;  
## 📖 [Documentation and Support](http://backtestjs.com)
Immerse yourself in the BacktestJS universe with our [Full Documentation](http://backtestjs.com). Discover tutorials, video guides, and extensive examples. Engage with our community forum for unparalleled support and discussions. Visit our site to unleash the full capabilities of BacktestJS.

&nbsp;  
## 🔄 Download / Import Historical Candle Data
Effortlessly download candle data from Binance or import from a CSV for strategy execution — no coding required! Plus, easily export your data to CSV via the CLI at anytime with a few clicks.

&nbsp;  
## 💡 Examples

#### **No Params**

Below is an example of a simple 3 over 45 SMA strategy.  You buy once the 3 crosses the 45 and sell if not.  In this example we dont use the power of params.
```bash
import { BTH } from "../infra/interfaces"
import { indicatorSMA } from "../indicators/moving-averages"

export async function sma(bth: BTH) {
    // Get Candles
    const lowSMACandles = await bth.getCandles('close', 0, 3)
    const highSMACandles = await bth.getCandles('close', 0, 45)

    // Get SMA
    const lowSMA = await indicatorSMA(lowSMACandles, 3)
    const highSMA = await indicatorSMA(highSMACandles, 45)

    // Perform Buy / Sell when low crosses high
    if (lowSMA > highSMA) {
        await bth.buy()
    } else {
        await bth.sell()
    }
}
```

#### **With Params**
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

    // Get SMA
    const lowSMA = await indicatorSMA(lowSMACandles, lowSMAInput)
    const highSMA = await indicatorSMA(highSMACandles, highSMAInput)

    // Perform Buy / Sell when low crosses high
    if (lowSMA > highSMA) {
        await bth.buy()
    } else {
        await bth.sell()
    }
}
```

&nbsp;  
## 🎨 Showcase of Results
BacktestJS not only delivers performance insights but also visualizes your strategy's effectiveness through comprehensive charts and statistics.

### 🏆 Income Results, Buy/Sell Locations, and More
Explore the visual representation of your trading outcomes, from income results to buy/sell locations, offering you a clear view of your strategy's performance.

![Income Results](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Results-Income-Results.png)

![Buy Sell Locations](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Results-Buy-Sell-Locations.png)

![General Info](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Results-General-Info.png)

![Total Stats](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Results-Total-Stats.png)

![All Orders](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Results-All-Orders.png)

![Trade Stats](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Results-Trading-Stats.png)

![Trade Buy Sell Stats](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Results-Trade-Buy-Sell-Stats.png)

![Asset Stats](http://backtestjs.com/wp-content/uploads/2024/02/Multi-Value-Symbol-Trading-Results-Asset-Stats.png)

### 🔍 Multi Value Results
Examine permutation results and heatmap visualizations to refine your strategies across different values all in one run.

![Permutation Results](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Strategy-Results-Multi-Value-Permutation-Results.png)

![Heatmap](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Strategy-Results-Multi-Value-Heatmap.png)

![General Info](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Strategy-Results-Multi-Value-General-Info.png)

![Total Stats](http://backtestjs.com/wp-content/uploads/2024/02/Trading-Strategy-Results-Multi-Value-Total-Stats.png)

### 🌍 Multi Symbol Results
See if that killer strategy works across the board on many symbols and timeframes with ease.  Get all your results in one shot with blazing fast results.

![General Info](http://backtestjs.com/wp-content/uploads/2024/01/Multi-Symbol-Trading-Strategy-Results-General-Info.png)

![Total Stats](http://backtestjs.com/wp-content/uploads/2024/01/Multi-Symbol-Trading-Strategy-Results-Total-Stats.png)

![Permutation Results](http://backtestjs.com/wp-content/uploads/2024/01/Multi-Symbol-Trading-Strategy-Results-Permutation-Results.png)

&nbsp;  
## ✍️ Author

#### Andrew Baronick  

[Github](https://www.github.com/andrewbaronick)  
[LinkedIn](https://www.linkedin.com/in/andrew-baronick/)