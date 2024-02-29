// ---------------------------------------------------- 
// |             EDIT HISTORICAL DATA PORTAL          |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { getCandleMetaData, deleteCandles, getCandles } from '../../helpers/prisma-historical-data'
import { interactCLI, handlePortalReturn } from '../../helpers/portals'
import { updateHistoricalData } from '../../helpers/historical-data'
import { createCandlesChart } from '../../helpers/charts'
import { getCandleStartDate } from '../../helpers/api'
import { exportCSV } from '../../helpers/csv'

// Define infra imports
import { headerEditHistoricalData } from '../../infra/headers'
import { DataReturn } from '../../infra/interfaces'
import { colorHeader } from '../../infra/colors'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function editPortal(name: string) {
    // Clear console
    console.clear()

    // Define back and portal return params
    let back = false
    let portalReturn: DataReturn = { error: false, data: '' }

    while (!back) {
        // Get candle metadata
        const metaDataResults = await getCandleMetaData(name)
        if (metaDataResults.error) return metaDataResults

        if (typeof metaDataResults.data !== 'string') {
            // Create candle title
            const metaData = metaDataResults.data
            const title = `|   ${metaData.symbol}   |   ${metaData.interval}   |   ${new Date(metaData.startTime).toLocaleString()}   |  ${new Date(metaData.endTime).toLocaleString()} `

            // Define choices for edit historical data screen
            let choices: string[] = []
            choices.push('📈 View Candles Chart in Browser')
            if (!metaData.importedFromCSV) choices.push('🔼 Top Up')
            if (!metaData.importedFromCSV) choices.push('🔄 Update')
            choices.push('📥 Download Candles as CSV')
            choices.push('❌ Delete Candles')
            choices.push('👈 Back')

            // Show headers
            headerEditHistoricalData()
            console.log('')
            console.log(colorHeader(' --------------------------------------------------------------------------------------------------'))
            console.log(colorHeader(`|     ***** ${title} *****     |`))
            console.log(colorHeader(' --------------------------------------------------------------------------------------------------'))

            // Handle portal return
            if (portalReturn.data !== '') await handlePortalReturn(portalReturn)

            // Interact with user
            const choiceCLI = await interactCLI({
                type: 'autocomplete',
                message: 'Choose what to do:',
                choices
            })

            // Open chart of candles in browser
            if (choiceCLI.includes('📈')) {
                // Get candles
                const candlesRequest = await getCandles(name)
                if (candlesRequest.error) return candlesRequest

                // Show chart in browser
                if (typeof candlesRequest.data !== 'string') {
                    const candles = candlesRequest.data.candles
                    await createCandlesChart(candles, name)
                }
            }

            // Top up candles from current end to now
            else if (choiceCLI.includes('🔼')) portalReturn = await updateHistoricalData(metaData, new Date().getTime())

            // Define new start / end times to download and save
            else if (choiceCLI.includes('🔄')) {
                let newTime: number
                let addNewStartDate = await interactCLI({
                    type: 'autocomplete',
                    message: 'Add new start time:',
                    choices: ['Yes', 'No']
                })

                if (addNewStartDate === 'Yes') {
                    const startTimeRequest = await getCandleStartDate(metaData.symbol)
                    const startTime = startTimeRequest.data
                    const startTimeInput = await interactCLI({
                        type: 'date',
                        message: 'New Start Date:',
                        dateDefault: startTime
                    })
                    newTime = new Date(startTimeInput).getTime()

                    // Validate start time
                    if (newTime < startTime) return { error: true, data: `Date must be on or after the symbols listing date of ${new Date(startTime).toLocaleString()}` }
                    else if (startTime > metaData.startTime) return { error: true, data: `Date must be on or before the already downloaded data start date of ${new Date(metaData.startTime).toLocaleString()}` }
                } else {
                    const endTimeInput = await interactCLI({
                        type: 'date',
                        message: 'New End Date:',
                        dateDefault: new Date().getTime()
                    })
                    newTime = new Date(endTimeInput).getTime()

                    // Validate end time
                    if (newTime > new Date().getTime()) return { error: true, data: `Date must be on or before now: ${new Date().toLocaleString()}` }
                    else if (newTime < metaData.endTime) return { error: true, data: `Date must be after your declared start time of ${new Date(metaData.endTime).toLocaleString()}` }
                }
                portalReturn = await updateHistoricalData(metaData, newTime)
            }

            // Export the symbol
            else if (choiceCLI.includes('📥')) portalReturn = await exportCSV(name)

            // Remove the symbol / interval from the DB
            else if (choiceCLI.includes('❌')) {
                // Delete candles and metaData
                portalReturn = await deleteCandles(name)
                if (!portalReturn.error) back = true
            }

            // Go back
            else if (choiceCLI.includes('👈')) {
                back = true
                portalReturn.error = false
                portalReturn.data = ''
            }

            // Clear console
            console.clear()
        }
    }
    return portalReturn
}