// ---------------------------------------------------- 
// |                   CHART HELPERS                  |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define imports
import { LooseObject, Candle, Order } from "../infra/interfaces"
const { exec } = require('child_process')
import { platform } from 'os'
import express from 'express'
import * as fs from 'fs'
import path from 'path'

const app = express()
let serverStarted = false

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

async function startServer(url: string) {
    // Start express server if not started yet
    if (!serverStarted) {
        app.use(express.static(path.join(`${__dirname}/../../charts`)))
        app.listen(8000)
        serverStarted = true
    }

    // Define platfom
    const osPlatform = platform()
    let command: string

    // Find users OS type
    if (osPlatform === 'win32') command = `start microsoft-edge:${url}`
    else if (osPlatform === 'darwin') command = `open -a "Google Chrome" ${url}`
    else command = `google-chrome --no-sandbox ${url}`

    // Open browser
    exec(command)
}

export async function createResultsCharts(allWorths: LooseObject, allCandles: Candle[], allOrders: Order[], runResultsStats: LooseObject) {
    // Map the candles to proper format
    const allCandlesResults = allCandles.map((candle: Candle) => {
        return {
            time: candle.closeTime,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close
        }
    })

    // Create necessary json files
    fs.writeFileSync(`${__dirname}/../../charts/results-orders.json`, JSON.stringify(allOrders))
    fs.writeFileSync(`${__dirname}/../../charts/results-worths.json`, JSON.stringify(allWorths))
    fs.writeFileSync(`${__dirname}/../../charts/results-stats.json`, JSON.stringify(runResultsStats.data))
    fs.writeFileSync(`${__dirname}/../../charts/results-candles.json`, JSON.stringify(allCandlesResults))

    // Open in browser
    await startServer('http://localhost:8000/results.html')
}

export async function createResultsChartsMulti(results: LooseObject, resultsUnsorted: LooseObject, resultStats: LooseObject) {
    // Create necessary json files
    fs.writeFileSync(`${__dirname}/../../charts/results-multi.json`, JSON.stringify(results))
    fs.writeFileSync(`${__dirname}/../../charts/results-unsorted-multi.json`, JSON.stringify(resultsUnsorted))
    fs.writeFileSync(`${__dirname}/../../charts/results-stats-multi.json`, JSON.stringify(resultStats.data))

    // Open in browser
    await startServer('http://localhost:8000/results-multi.html')
}

export async function createCandlesChart(allCandles: Candle[], symbolName: string) {
    // Map the candles to proper format
    const allCandlesResults = allCandles.map((candle: Candle) => {
        return {
            time: candle.closeTime,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close
        }
    })

    // Create necessary json files
    fs.writeFileSync(`${__dirname}/../../charts/candles.json`, JSON.stringify(allCandlesResults))
    fs.writeFileSync(`${__dirname}/../../charts/candleName.json`, JSON.stringify({ name: symbolName }))

    // Open in browser
    await startServer('http://localhost:8000/candles.html')
}
