// ---------------------------------------------------- 
// |          DOWNLOAD HISTORICAL DATA PORTAL         |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { saveHistoricalData, intervals } from '../../helpers/historical-data'
import { getAllCandleMetaData } from '../../helpers/prisma-historical-data'
import { getCandleStartDate } from '../../helpers/api'
import { interactCLI } from '../../helpers/portals'

// Define infra imports
import { headerDownloadHistoricalData } from '../../infra/headers'
import { MetaCandle } from '../../infra/interfaces'
import { colorError } from '../../infra/colors'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function downloadHistoricalDataPortal() {
    // Clear console
    console.clear()

    // Define function globals
    let valid = false
    let symbolStart = 0
    let symbol = ''
    let choiceInterval = ''
    let startTime = 0
    let endTime = 0

    // Get historical metadata
    const metaData = await getAllCandleMetaData()
    if (metaData.error) return metaData

    // Show header 
    headerDownloadHistoricalData()

    // Request symbol name from user
    while (!valid) {
        while (!valid) {
            symbol = (await interactCLI({
                type: 'input',
                message: 'Symbol:'
            })).toUpperCase()

            let SymbolStartTime = await getCandleStartDate(symbol)
            valid = !SymbolStartTime.error
            if (!valid) {
                SymbolStartTime = await getCandleStartDate(`${symbol}USDT`)
                valid = !SymbolStartTime.error
                if (valid) symbol = `${symbol}USDT`
            }
            if (SymbolStartTime.error) console.log(colorError(`Symbol ${symbol} does not exist`))
            else symbolStart = SymbolStartTime.data
        }
        valid = false

        // Request interval from user
        choiceInterval = await interactCLI({
            type: 'autocomplete',
            message: 'Interval:',
            choices: intervals
        })
        if (typeof metaData.data !== 'string') {
            valid = !metaData.data.some((meta: MetaCandle) => meta.name === `${symbol}-${choiceInterval}`)
        }
        if (!valid) console.log(colorError(`Entry already exists for ${symbol} at the ${choiceInterval} interval, either edit or remove the existing entry`))
    }
    valid = false

    // Request start time from user
    while (!valid) {
        const now = new Date().getTime()
        const startTimeInput = await interactCLI({
            type: 'date',
            message: 'Start Date:',
            dateDefault: symbolStart
        })
        startTime = new Date(startTimeInput).getTime()

        // Validate start time
        if (startTime < symbolStart) console.log(colorError(`Date must be on or after ${new Date(symbolStart).toLocaleString()}`))
        else if (startTime > now) console.log(colorError(`Date must be on or before ${new Date(now).toLocaleString()}`))
        else valid = true
    }
    valid = false

    // Request end time from user
    while (!valid) {
        const now = new Date().getTime()
        const endTimeInput = await interactCLI({
            type: 'date',
            message: 'End Date:',
            dateDefault: now
        })
        endTime = new Date(endTimeInput).getTime()

        // Validate end time
        if (endTime > now) console.log(colorError(`Date must be on or before ${new Date(now).toLocaleString()}`))
        else if (endTime <= startTime) console.log(colorError(`Date must be after your declared start time of ${new Date(startTime).toLocaleString()}`))
        else valid = true
    }
    valid = false

    // Create object for candle retrieval
    const objectGetHistoricalData = {
        symbol: symbol,
        interval: choiceInterval,
        startTime: startTime,
        endTime: endTime
    }

    // Get candles
    return await saveHistoricalData(objectGetHistoricalData)
}