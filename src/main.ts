#!/usr/bin/env node
// ---------------------------------------------------- 
// |                    MAIN PORTAL                   |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { interactCLI, handlePortalReturn } from './helpers/portals'

// Define infra imports
import { DataReturn } from './infra/interfaces'
import { headerMain } from './infra/headers'

// Define portal imports
import { mainHistoricalDataPortal } from './portals/historical-data/main'
import { mainStrategyPortal } from './portals/strategies/main'
import { viewResultsPortal } from './portals/results/view-results'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

async function main() {
    // Clear console
    console.clear()

    // Define exit and portal return params
    let exit = false
    let portalReturn: DataReturn = { error: false, data: '' }

    // Define choices for main screen
    const choices = [
        '📚 Historical Candle Data',
        '💎 Trading Strategies',
        '📜 View Saved Trading Results',
        '👈 Exit'
    ]

    while (!exit) {
        // Show header 
        headerMain()

        // Handle portal return
        if (portalReturn.data !== '') await handlePortalReturn(portalReturn)

        // Interact with user
        const responseCLI = await interactCLI({
            type: 'autocomplete',
            message: 'Choose what to do:',
            choices
        })

        // Choose which route to go
        if (responseCLI.includes('📚')) portalReturn = await mainHistoricalDataPortal()
        else if (responseCLI.includes('💎')) portalReturn = await mainStrategyPortal()
        else if (responseCLI.includes('📜')) portalReturn = await viewResultsPortal()
        else if (responseCLI.includes('👈')) {
            exit = true
            portalReturn.error = false
            portalReturn.data = ''
        }

        // Clear console
        console.clear()
    }
}

// ---------------------------------------------------- 
// |                  Start Program                   |
// ---------------------------------------------------- 

try {
    main()
} catch (error) {
    console.log(error)
    process.exit()
}
