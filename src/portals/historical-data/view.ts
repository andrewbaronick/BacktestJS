// ---------------------------------------------------- 
// |            VIEW HISTORICAL DATA PORTAL           |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { getAllCandleMetaData } from '../../helpers/prisma-historical-data'
import { interactCLI, handlePortalReturn } from '../../helpers/portals'
import { parseHistoricalData } from '../../helpers/parse'

// Define infra imports
import { DataReturn, MetaCandle } from '../../infra/interfaces'
import { headerViewHistoricalData } from '../../infra/headers'
import { colorChoice } from '../../infra/colors'

// Define portal imports
import { editPortal } from './edit'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function viewHistoricalDataPortal() {
    // Clear console
    console.clear()

    // Define back and portal return params
    let back = false
    let portalReturn: DataReturn = { error: false, data: '' }

    while (!back) {
        // Get historical metadata
        const metaData = await getAllCandleMetaData()
        if (metaData.error) return metaData

        if (typeof metaData.data !== 'string') {
            // Update if list is empty
            if (metaData.data.length === 0) return { error: true, data: 'There are no saved candles' }

            // Define choices
            let choices: string[] = []
            choices = await parseHistoricalData(metaData.data.map((data: MetaCandle) => data.name))

            // Add back choice to choices
            choices.push(colorChoice('👈 Back'))

            // Update if list is empty
            if (choices.length === 0) return { error: true, data: 'There are no saved historical data entries' }

            // Show header 
            headerViewHistoricalData()

            // Handle portal return
            if (portalReturn.data !== '') await handlePortalReturn(portalReturn)

            // Interact with user
            const choiceCLI = await interactCLI({
                type: 'autocomplete',
                message: 'Choose a symbol / iterval to interact with:',
                choices
            })

            // Choose which flow to go
            if (choiceCLI.includes('👈')) {
                back = true
                portalReturn.error = false
                portalReturn.data = ''
            }
            else {
                // Find user choice and open edit page with it
                let userChoice = ''
                for (let i = 0; i < choices.length; i++) {
                    if (choices[i] === choiceCLI) {
                        userChoice = metaData.data[i].name
                        break
                    }
                }
                portalReturn = await editPortal(userChoice)
            }

            // Clear console
            console.clear()
        }
    }
    return portalReturn
}