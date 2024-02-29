// ---------------------------------------------------- 
// |                 VIEW RESULTS PORTAL              |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { getAllStrategyResultNames, getResult } from '../../helpers/prisma-results'
import { getAllMultiResults, getMultiResult } from '../../helpers/prisma-results-multi-value'
import { interactCLI, handlePortalReturn } from '../../helpers/portals'

// Define infra imports
import { DataReturn } from '../../infra/interfaces'
import { headerResults } from '../../infra/headers'

// Define portal imports
import { resultsPortalMulti } from './run-results-multi'
import { resultsPortal } from './run-results'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function viewResultsPortal() {
    // Clear console
    console.clear()

    // Define back and portal return params
    let back = false
    let portalReturn: DataReturn = { error: false, data: '' }

    while (!back) {
        // Get all result names
        const choicesResults = await getAllStrategyResultNames()
        if (choicesResults.error) return choicesResults
        const choicesMulti = await getAllMultiResults()
        if (choicesMulti.error) return choicesMulti
        let choices = [...choicesResults.data, ...choicesMulti.data]
        if (typeof choices !== 'string') {
            // Update if list is empty
            if (choices.length === 0) return { error: true, data: 'There are no saved trading results' }

            // Add back option to choices
            choices.push('👈 Back')


            // Show header 
            headerResults()

            // Handle portal return
            if (portalReturn.data !== '') await handlePortalReturn(portalReturn)

            // Interact with user
            const choiceCLI = await interactCLI({
                type: 'autocomplete',
                message: 'Choose which result to view:',
                choices: choices
            })

            // Go back if needed
            if (choiceCLI.includes('👈')) return { error: false, data: '' }

            // Get results chosen from user
            if (choicesMulti.data.includes(choiceCLI)) {
                const strategyResults = await getMultiResult(choiceCLI)
                if (strategyResults.error) return strategyResults
                if (typeof strategyResults.data !== 'string') {
                    // Go to the results portal
                    portalReturn = await resultsPortalMulti(strategyResults.data, false)
                }
            } else {
                const strategyResults = await getResult(choiceCLI)
                if (strategyResults.error) return strategyResults
                if (typeof strategyResults.data !== 'string') {
                    // Go to the results portal
                    portalReturn = await resultsPortal(strategyResults.data, false)
                }
            }

            // Clear console
            console.clear()
        }
    }
    return portalReturn
}
