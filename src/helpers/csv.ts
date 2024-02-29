// ---------------------------------------------------- 
// |                     CSV HELPERS                  |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define imports
import { LooseObject, ImportCSV, Candle } from "../infra/interfaces"
import { insertCandles, getCandles } from './prisma-historical-data'
import { colorError, colorSuccess } from '../infra/colors'
import { interactCLI } from './portals'
import csvToJson from 'csvtojson'
import * as path from 'path'
import * as fs from 'fs'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function importCSV(importCSVParams: ImportCSV) {
    // Check if file exists
    let jsonCSV: LooseObject
    try {
        jsonCSV = await csvToJson().fromFile(importCSVParams.path)
    } catch (error) {
        return { error: true, data: `Path ${importCSVParams.path} does not exist or is incorrect` }
    }

    // Check for date field
    let closeTimeKey = ''
    if (jsonCSV[0].closeTime !== undefined || jsonCSV[0].closetime !== undefined || jsonCSV[0].date !== undefined || jsonCSV[0].Date !== undefined) {
        if (jsonCSV[0].CloseTime !== undefined) closeTimeKey = 'CloseTime'
        else if (jsonCSV[0].closeTime !== undefined) closeTimeKey = 'closeTime'
        else if (jsonCSV[0].closetime !== undefined) closeTimeKey = 'closetime'
        else if (jsonCSV[0].date !== undefined) closeTimeKey = 'date'
        else if (jsonCSV[0].Date !== undefined) closeTimeKey = 'Date'
    } else return { error: true, data: `CSV at ${importCSVParams.path} does not have a date, Date, closeTime or, closetime field` }

    // Check for open field
    let openKey = ''
    if (jsonCSV[0].open !== undefined || jsonCSV[0].Open !== undefined) {
        if (jsonCSV[0].open !== undefined) openKey = 'open'
        if (jsonCSV[0].Open !== undefined) openKey = 'Open'
    } else return { error: true, data: `CSV at ${importCSVParams.path} does not have an open or Open field` }

    // Check for close field
    let closeKey = ''
    if (jsonCSV[0].close !== undefined || jsonCSV[0].Close !== undefined) {
        if (jsonCSV[0].close !== undefined) closeKey = 'close'
        if (jsonCSV[0].Close !== undefined) closeKey = 'Close'
    } else return { error: true, data: `CSV at ${importCSVParams.path} does not have a close or Close field` }

    // Check for low field
    let lowKey = ''
    if (jsonCSV[0].low !== undefined || jsonCSV[0].Low !== undefined) {
        if (jsonCSV[0].low !== undefined) lowKey = 'low'
        if (jsonCSV[0].Low !== undefined) lowKey = 'Low'
    } else return { error: true, data: `CSV at ${importCSVParams.path} does not have a low or Low field` }

    // Check for high field
    let highKey = ''
    if (jsonCSV[0].high !== undefined || jsonCSV[0].High !== undefined) {
        if (jsonCSV[0].high !== undefined) highKey = 'high'
        if (jsonCSV[0].High !== undefined) highKey = 'High'
    } else return { error: true, data: `CSV at ${importCSVParams.path} does not have a high or High field` }

    // Check for optional fields
    let optionalFileds: LooseObject = {}

    // Check for open time
    let openTimeKey = ''
    if (jsonCSV[0].opentime !== undefined || jsonCSV[0].openTime !== undefined || jsonCSV[0].OpenTime !== undefined) {
        optionalFileds.openTime = true
        if (jsonCSV[0].opentime !== undefined) openTimeKey = 'opentime'
        if (jsonCSV[0].openTime !== undefined) openTimeKey = 'openTime'
        if (jsonCSV[0].OpenTime !== undefined) openTimeKey = 'OpenTime'
    }

    // Check for volume
    let volumeKey = ''
    if (jsonCSV[0].volume !== undefined || jsonCSV[0].Volume !== undefined) {
        optionalFileds.volume = true
        if (jsonCSV[0].volume !== undefined) volumeKey = 'volume'
        if (jsonCSV[0].Volume !== undefined) volumeKey = 'Volume'
    }

    // Check for asset volume
    let assetVolumeKey = ''
    if (jsonCSV[0].assetvolume !== undefined || jsonCSV[0].assetVolume !== undefined || jsonCSV[0].AssetVolume !== undefined) {
        optionalFileds.assetVolume = true
        if (jsonCSV[0].assetvolume !== undefined) assetVolumeKey = 'assetvolume'
        if (jsonCSV[0].assetVolume !== undefined) assetVolumeKey = 'assetVolume'
        if (jsonCSV[0].AssetVolume !== undefined) assetVolumeKey = 'AssetVolume'
    }

    // Check for number of trades
    let numberOfTradesKey = ''
    if (jsonCSV[0].numberoftrades !== undefined || jsonCSV[0].numberOfTrades !== undefined || jsonCSV[0].NumberOfTrades !== undefined) {
        optionalFileds.numberOfTrades = true
        if (jsonCSV[0].numberoftrades !== undefined) numberOfTradesKey = 'numberoftrades'
        if (jsonCSV[0].numberOfTrades !== undefined) numberOfTradesKey = 'numberOfTrades'
        if (jsonCSV[0].NumberOfTrades !== undefined) numberOfTradesKey = 'NumberOfTrades'
    }

    // Show whats able to import
    console.log(colorSuccess('✅ Found Close Time'))
    console.log(colorSuccess('✅ Found Open'))
    console.log(colorSuccess('✅ Found High'))
    console.log(colorSuccess('✅ Found Low'))
    console.log(colorSuccess('✅ Found Close'))
    console.log(optionalFileds.openTime ? colorSuccess('✅ Found Open Time') : colorError('❌ Didnt Find Open Time will populate with 0'))
    console.log(optionalFileds.volume ? colorSuccess('✅ Found Volume') : colorError('❌ Didnt Find Volume will populate with 0'))
    console.log(optionalFileds.assetVolume ? colorSuccess('✅ Found Asset Volume') : colorError('❌ Didnt Find Asset Volume will populate with 0'))
    console.log(optionalFileds.numberOfTrades ? colorSuccess('✅ Found Number Of Trades') : colorError('❌ Didnt Find Number Of Trades will populate with 0'))

    // Ask user if want to continue
    const continueToImport = await interactCLI({
        type: 'autocomplete',
        message: 'Import CSV and save to DB?:',
        choices: ['Yes', 'No']
    })

    // Go back if user does not want to continue
    if (continueToImport === 'No') return { error: false, data: 'Successfully cancelled importing data from CSV' }

    // Parse JSON for DB
    let jsonParsedCandles: Candle[] = []
    for (let i = 0; i < jsonCSV.length; i++) {
        jsonParsedCandles.push({
            openTime: optionalFileds.openTime ? new Date(jsonCSV[i][openTimeKey]).getTime() : 0,
            open: +jsonCSV[i][openKey],
            high: +jsonCSV[i][highKey],
            low: +jsonCSV[i][lowKey],
            close: +jsonCSV[i][closeKey],
            volume: optionalFileds.volume ? +jsonCSV[i][volumeKey] : 0,
            closeTime: new Date(jsonCSV[i][closeTimeKey]).getTime(),
            assetVolume: optionalFileds.assetVolume ? +jsonCSV[i][assetVolumeKey] : 0,
            numberOfTrades: optionalFileds.numberOfTradesKey ? +jsonCSV[i][numberOfTradesKey] : 0
        })
    }

    // Create and add meta data
    const meta = {
        name: `${importCSVParams.base + importCSVParams.quote}-${importCSVParams.interval}`,
        symbol: importCSVParams.base + importCSVParams.quote,
        interval: importCSVParams.interval,
        base: importCSVParams.base,
        quote: importCSVParams.quote,
        startTime: jsonParsedCandles[0].closeTime,
        endTime: jsonParsedCandles[jsonParsedCandles.length - 1].closeTime,
        importedFromCSV: true,
        creationTime: new Date().getTime(),
        lastUpdatedTime: new Date().getTime()
    }

    // Insert candles into the DB
    const insertedCandles = await insertCandles(meta, jsonParsedCandles)
    if (insertedCandles.error) return insertedCandles

    // Return success
    return { error: false, data: `Successfully imported ${importCSVParams.base + importCSVParams.quote} from ${new Date(meta.startTime).toLocaleString()} to ${new Date(meta.endTime).toLocaleString()}` }
}

export async function exportCSV(name: string) {
    // Clear the console
    console.clear()

    // Get candles
    const candlesRequest = await getCandles(name)
    if (candlesRequest.error) return candlesRequest
    if (typeof candlesRequest.data !== 'string') {
        // Get candles keys for the header row
        const keys = Object.keys(candlesRequest.data.candles[0])

        // Create the header row
        const headerRow = keys.join(',') + '\n'

        // Create the data rows
        const dataRows = candlesRequest.data.candles.map((obj: LooseObject) => {
            const values = keys.map(key => {
                const value = obj[key]
                return typeof value === 'string' ? `"${value}"` : value
            })
            return values.join(',')
        }).join('\n')

        // Check if the directory exists, and create it if it doesn't
        const dir = './csv';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        // Write the file to csv folder
        const filePath = path.join(dir, `${name}.csv`);
        fs.writeFileSync(filePath, headerRow + dataRows)
    }

    // Return success
    return { error: false, data: `Successfully exported data to ./csv folder with name ${name}.csv` }
}
