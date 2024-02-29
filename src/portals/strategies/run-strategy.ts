// ---------------------------------------------------- 
// |                 RUN STRATEGY PORTAL              |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { getAllStrategies, getStrategy, updateLastRunTime } from '../../helpers/prisma-strategies'
import { getAllCandleMetaData, getCandleMetaData } from '../../helpers/prisma-historical-data'
import { parseHistoricalData } from '../../helpers/parse'
import { interactCLI } from '../../helpers/portals'
import { run } from '../../helpers/run-strategy'

// Define infra imports
import { LooseObject, DataReturn, MetaCandle, StrategyMeta } from "../../infra/interfaces"
import { colorChoice, colorError, colorMessage } from '../../infra/colors'
import { headerRunStrategy } from '../../infra/headers'

// Define portal imports
import { resultsPortal } from '../results/run-results'
import { resultsPortalMulti } from '../results/run-results-multi'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function runStrategyPortal(runFast: boolean) {
    // Clear console
    console.clear()

    // Define function globals
    let back = false
    let valid = false
    let portalReturn: DataReturn = { error: false, data: '' }

    // Create run params
    let runParams = {
        strategyName: '',
        historicalMetaData: [],
        startingAmount: 0,
        startTime: 0,
        endTime: 0,
        params: {},
        percentFee: 0,
        percentSlippage: 0
    }

    while (!back) {
        // Get all strategies
        const strategyMetaDatas = await getAllStrategies()
        if (strategyMetaDatas.error) return strategyMetaDatas
        let choicesStrategy: string[] = []
        if (typeof strategyMetaDatas.data !== 'string') choicesStrategy = strategyMetaDatas.data.map((strategy: StrategyMeta) => strategy.name)

        // Get all historical metaData 
        const historicalMetaDatas = await getAllCandleMetaData()
        if (historicalMetaDatas.error) return historicalMetaDatas
        let choicesHistoricalData: string[] = []
        if (typeof historicalMetaDatas.data !== 'string') {
            choicesHistoricalData = await parseHistoricalData(historicalMetaDatas.data.map((data: MetaCandle) => data.name))
        }

        // Update if list is empty
        if (choicesStrategy.length === 0) return { error: true, data: 'There are no saved strategies' }
        if (choicesHistoricalData.length === 0) return { error: true, data: 'There are no historica candle data entries, download from binance or import from csv' }

        // Add back to choices
        choicesStrategy.push('👈 ' + colorChoice('Back'))

        // Show header 
        headerRunStrategy()

        // Ask user to choose a strategy
        runParams.strategyName = await interactCLI({
            type: 'autocomplete',
            message: 'Choose a strategy to run:',
            choices: choicesStrategy
        })

        // Go back if needed
        if (runParams.strategyName.includes('👈')) return { error: false, data: '' }

        let choiceHistoricalData: string[] = []

        while (choiceHistoricalData.length === 0) {
            // Choose choiceHistoricalData data to run on
            choiceHistoricalData = await interactCLI({
                type: 'checkbox',
                message: 'Choose which candle(s) set to run on:',
                choices: choicesHistoricalData
            })
        }

        // Find historical data user choice
        for (let i = 0; i < choiceHistoricalData.length; i++) {
            for (let j = 0; j < choicesHistoricalData.length; j++) {
                if (choiceHistoricalData[i] === choicesHistoricalData[j]) {
                    //@ts-ignore
                    runParams.historicalMetaData.push(historicalMetaDatas.data[j].name)
                    break
                }
            }
        }

        // Define if running with multiple symbols
        const isMultiSymbol = runParams.historicalMetaData.length > 1

        // Get candle metaData
        const historicalMetaDataResults = await getCandleMetaData(runParams.historicalMetaData[0])
        if (historicalMetaDataResults.error) return historicalMetaDataResults
        const historicalMetaData = historicalMetaDataResults.data

        // Get stragegy
        const metaDataStrategyResults = await getStrategy(runParams.strategyName)
        if (metaDataStrategyResults.error) return metaDataStrategyResults
        const metaDataStrategy = metaDataStrategyResults.data

        let paramsCache: LooseObject = {}

        if (typeof metaDataStrategy !== 'string') {
            // Ask user to fill out strategy params
            for (let i = 0; i < metaDataStrategy.params.length; i++) {
                let param: string | number = await interactCLI({
                    type: 'input',
                    message: metaDataStrategy.params[i]
                })
                if (param === undefined || param === '') param = 0
                paramsCache[metaDataStrategy.params[i]] = isNaN(+param) ? param : +param
            }

            if (metaDataStrategy.dynamicParams) {
                let doneWithParams = false
                while (!doneWithParams) {
                    const addParam = await interactCLI({
                        type: 'autocomplete',
                        message: 'Add a param:',
                        choices: ['Yes', 'No']
                    })
                    if (addParam === 'Yes') {
                        let paramName = (await interactCLI({
                            type: 'input',
                            message: 'Param name:'
                        }))
                        let param = (await interactCLI({
                            type: 'input',
                            message: paramName
                        }))

                        if (param === undefined || param === '') param = 0
                        paramsCache[paramName] = isNaN(+param) ? param : +param
                    } else doneWithParams = true
                }
            }
            runParams.params = paramsCache
        }

        // Check if should ask additional questions or run fast
        if (typeof historicalMetaData !== 'string' && typeof metaDataStrategy !== 'string') {
            if (!runFast) {
                if (!isMultiSymbol) {
                    // Get start time from user
                    while (!valid) {
                        const startTimeInput = await interactCLI({
                            type: 'date',
                            message: 'Start Date:',
                            dateDefault: historicalMetaData.startTime
                        })
                        runParams.startTime = new Date(startTimeInput).getTime()

                        // Validate start time
                        if (runParams.startTime < historicalMetaData.startTime) console.log(colorError(`Date must be on or after ${new Date(historicalMetaData.startTime).toLocaleString()}`))
                        else if (runParams.startTime > historicalMetaData.endTime) console.log(colorError(`Date must be on or before ${new Date(historicalMetaData.endTime).toLocaleString()}`))
                        else valid = true
                    }
                    valid = false

                    // Get end time from user
                    while (!valid) {
                        const endTimeInput = await interactCLI({
                            type: 'date',
                            message: 'End Date:',
                            dateDefault: historicalMetaData.endTime
                        })
                        runParams.endTime = new Date(endTimeInput).getTime()

                        // Validate end time
                        if (runParams.endTime > historicalMetaData.endTime) console.log(colorError(`Date must be on or before ${new Date(historicalMetaData.endTime).toLocaleString()}`))
                        else if (runParams.endTime <= runParams.startTime) console.log(colorError(`Date must be after your declared start time of ${new Date(runParams.startTime).toLocaleString()}`))
                        else valid = true
                    }
                } else {
                    runParams.startTime = historicalMetaData.startTime
                    runParams.endTime = historicalMetaData.endTime
                }

                // Get quote starting amount from user
                runParams.startingAmount = +(await interactCLI({
                    type: 'input',
                    message: `Starting ${isMultiSymbol ? '' : historicalMetaData.quote} amount:`
                }))

                // Get tx fee / slippage if needed from user
                const choiceFee = await interactCLI({
                    type: 'autocomplete',
                    message: 'Add transaction fee or slippage:',
                    choices: ['Yes', 'No']
                })

                if (choiceFee === 'Yes') {
                    // Get tx fee from user
                    runParams.percentFee = +(await interactCLI({
                        type: 'input',
                        message: 'Transaction Fee Percentage (0 for none):'
                    }))

                    // Get slippage from user
                    runParams.percentSlippage = +(await interactCLI({
                        type: 'input',
                        message: 'Slippage Percentage (0 for none):'
                    }))
                }
            } else {
                // Default run fast params
                runParams.startingAmount = 1000
                runParams.startTime = historicalMetaData.startTime
                runParams.endTime = historicalMetaData.endTime
            }

            // Clear console
            console.clear()
            console.log(colorMessage(`Running ${runParams.strategyName} Strategy`))

            // Run the strategy
            //@ts-ignore
            const runResults: DataReturn = await run(runParams)
            if (runResults.error) return runResults

            // Update last run time
            const updateStrategyLastRunTime = await updateLastRunTime(runParams.strategyName, new Date().getTime())
            if (updateStrategyLastRunTime.error) return updateStrategyLastRunTime

            // ---------------------------------------------------- 
            // |                   LOG RESULTS                    |
            // ---------------------------------------------------- 
            if (typeof runResults.data !== 'string') {
                if (runResults.data.permutationDataReturn !== undefined || isMultiSymbol) {
                    return await resultsPortalMulti({
                        name: `${runParams.strategyName}-${historicalMetaData.name}-Multi`,
                        strategyName: runParams.strategyName,
                        symbols: runParams.historicalMetaData,
                        permutationCount: runResults.data.permutationDataReturn.length,
                        params: paramsCache,
                        startTime: runParams.startTime,
                        endTime: runParams.endTime,
                        txFee: runParams.percentFee,
                        slippage: runParams.percentSlippage,
                        startingAmount: runParams.startingAmount,
                        multiResults: runResults.data.permutationDataReturn,
                        isMultiValue: runResults.data.permutationDataReturn !== undefined,
                        isMultiSymbol
                    }, true)
                } else {
                    return runResults.data.allOrders.length > 0 ?
                        await resultsPortal({
                            name: `${runParams.strategyName}-${historicalMetaData.name}`,
                            historicalDataName: historicalMetaData.name,
                            candleMetaData: historicalMetaData,
                            candles: runResults.data.allCandles,
                            strategyName: runParams.strategyName,
                            params: runParams.params,
                            startTime: runParams.startTime,
                            endTime: runParams.endTime,
                            txFee: runParams.percentFee,
                            slippage: runParams.percentSlippage,
                            startingAmount: runParams.startingAmount,
                            runMetaData: runResults.data.runMetaData,
                            allOrders: runResults.data.allOrders,
                            allWorths: runResults.data.allWorths
                        }, true) : { error: false, data: 'Strategy did not perform any trades over the given time period' }
                }
            } else {
                return { error: false, data: 'Strategy did not return any data please try different params or add more historical data' }
            }
        }
    }
    return portalReturn
}