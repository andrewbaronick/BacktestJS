// ---------------------------------------------------- 
// |               STRATEGY RESULTS PORTAL            |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { insertMultiResult, getAllMultiResults, deleteMultiResult } from '../../helpers/prisma-results-multi-value'
import { interactCLI, handlePortalReturn } from '../../helpers/portals'
import { parseRunResultsStatsMulti, removeIndexFromTable, parseMultiResults } from '../../helpers/parse'
import { createResultsChartsMulti } from '../../helpers/charts'

// Define infra imports
import { DataReturn, StrategyResultMulti } from "../../infra/interfaces"
import { headerStrategyResults } from '../../infra/headers'
import { colorHeader } from '../../infra/colors'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function resultsPortalMulti(results: StrategyResultMulti, newResult: boolean) {
    // Clear console
    if (!newResult) console.clear()

    // Define back and portal return params
    let back = false
    let portalReturn: DataReturn = { error: false, data: '' }

    // Define choices for historical data screen
    let choices = [
        '🎉 All Trading Results In Browser',
        '📋 Table Of All Trading Results In CLI',
    ]
    choices.push(newResult ? '💾 Save Trading Results' : '🔥 Delete Trading Result')
    choices.push('👈 Back')

    while (!back) {
        // Handle portal return
        if (portalReturn.data !== '') await handlePortalReturn(portalReturn)

        // Show header 
        headerStrategyResults()

        // Interact with user
        const choiceCLI = await interactCLI({
            type: 'autocomplete',
            message: 'Choose what to see:',
            choices
        })

        // Show results in browser
        if (choiceCLI.includes('🎉')) {
            // Parse the results
            const runResultsStats = await parseRunResultsStatsMulti({
                name: results.name,
                permutationCount: results.multiResults.length,
                symbols: results.symbols,
                strategyName: results.strategyName,
                params: results.params,
                startTime: results.startTime,
                endTime: results.endTime,
                txFee: results.txFee,
                slippage: results.slippage,
                startingAmount: results.startingAmount,
                multiResults: results.multiResults,
                isMultiValue: results.isMultiValue,
                isMultiSymbol: results.isMultiSymbol
            })

            const multiResultsParsed = parseMultiResults([...results.multiResults], results.multiResults[0].assetAmounts.numberOfCandles, results.startingAmount, results.isMultiSymbol)
            const multiResults = {
                multiResults: [...multiResultsParsed],
                assetResults: results.multiResults[0].assetAmounts
            }

            // Open chart in browser with results
            await createResultsChartsMulti(multiResults, results.multiResults, runResultsStats)
        }

        // Show statistical results in the CLI
        else if (choiceCLI.includes('📋')) {
            // Parse the results
            const runResultsStatsReturn = await parseRunResultsStatsMulti({
                name: results.name,
                permutationCount: results.multiResults.length,
                symbols: results.symbols,
                strategyName: results.strategyName,
                params: results.params,
                startTime: results.startTime,
                endTime: results.endTime,
                txFee: results.txFee,
                slippage: results.slippage,
                startingAmount: results.startingAmount,
                multiResults: results.multiResults,
                isMultiValue: results.isMultiValue,
                isMultiSymbol: results.isMultiSymbol
            })
            if (runResultsStatsReturn.error) return runResultsStatsReturn
            const runResultsStats = runResultsStatsReturn.data

            const multiResults = parseMultiResults([...results.multiResults], results.multiResults[0].assetAmounts.numberOfCandles, results.startingAmount, results.isMultiSymbol)

            if (typeof runResultsStats !== 'string') {
                // Log general info
                console.log('')
                console.log(colorHeader('|              *** GENERAL ***            |'))
                removeIndexFromTable(runResultsStats.generalData)

                // Log total amounts / percentages
                console.log('')
                console.log(colorHeader('|                     *** TOTAL RESULTS ***                 |'))
                removeIndexFromTable(runResultsStats.totals)

                if (!results.isMultiSymbol) {
                    console.log('')
                    console.log(colorHeader('|            *** ASSET AMOUNTS / PERCENTAGES ***            |'))
                    removeIndexFromTable(runResultsStats.assetAmountsPercentages)
                }

                console.log('')
                console.log(colorHeader('|               *** ALL PERMUTATION RESULTS ***             |'))
                removeIndexFromTable(multiResults)
            }
        }

        // Save the results
        else if (choiceCLI.includes('💾')) {
            // Check if results already exist
            let allResultsReturn = await getAllMultiResults()
            if (allResultsReturn.error) return allResultsReturn
            let allResults = allResultsReturn.data

            const resultsName = await interactCLI({
                type: 'input',
                message: 'Type A Name For The Trading Results:'
            })
            if (resultsName !== undefined) results.name = resultsName

            if (allResults.includes(results.name)) {
                const saveResultsChoice = await interactCLI({
                    type: 'autocomplete',
                    message: `Results ${results.name} has saved results already, would you like to rewrite them`,
                    choices: ['Yes', 'No']
                })
                if (saveResultsChoice === 'No') {
                    return { error: false, data: 'Cancelled saving results' }
                } else {
                    // Delete already existing entry
                    const deleteResults = await deleteMultiResult(results.name)
                    if (deleteResults.error) return deleteResults
                }
            }

            // Save the results to the dB
            const saveResultsRes = await insertMultiResult(results)
            if (saveResultsRes.error) return saveResultsRes
            return { error: false, data: `Successfully saved results for ${results.name}` }
        }

        // Delete the results
        else if (choiceCLI.includes('🔥')) {
            // Delete result
            return await deleteMultiResult(results.name)
        }

        else if (choiceCLI.includes('👈')) back = true
    }
    return portalReturn
} 