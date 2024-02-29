// ---------------------------------------------------- 
// |               HISTORICAL DATA PORTAL             |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { interactCLI, handlePortalReturn } from '../../helpers/portals'

// Define infra imports
import { headerHistoricalData } from '../../infra/headers'
import { DataReturn } from '../../infra/interfaces'

// Define portal imports
import { viewHistoricalDataPortal } from './view'
import { downloadHistoricalDataPortal } from './download'
import { importCSVPortal } from './import-csv'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function mainHistoricalDataPortal() {
    // Clear console
    console.clear()

    // Define back and portal return params
    let back = false
    let portalReturn: DataReturn = { error: false, data: '' }

    // Define choices for historical data screen
    const choices = [
        '📖 View / Update / Delete Downloaded Candle Data',
        '🔽 Download Candle Data from Binance',
        '🖋️  Import Candle Data from CSV',
        '👈 Back',
    ]

    while (!back) {
        // Show header 
        headerHistoricalData()

        // Handle portal return
        if (portalReturn.data !== '') await handlePortalReturn(portalReturn)

        // Interact with user
        const choiceCLI = await interactCLI({
            type: 'autocomplete',
            message: 'Choose what to do:',
            choices
        })

        // Choose which route to go
        if (choiceCLI.includes('📖')) portalReturn = await viewHistoricalDataPortal()
        else if (choiceCLI.includes('🔽')) portalReturn = await downloadHistoricalDataPortal()
        else if (choiceCLI.includes('🖋️')) portalReturn = await importCSVPortal()
        else if (choiceCLI.includes('👈')) {
            back = true
            portalReturn.error = false
            portalReturn.data = ''
        }

        // Clear console
        console.clear()
    }
    return portalReturn
}