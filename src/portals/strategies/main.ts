// ---------------------------------------------------- 
// |                   STRATEGY PORTAL                |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { interactCLI, handlePortalReturn } from '../../helpers/portals'

// Define infra imports
import { headerStrategies } from '../../infra/headers'
import { DataReturn } from '../../infra/interfaces'

// Define portal imports
import { runStrategyPortal } from './run-strategy'
import { deleteStrategyPortal } from './delete'
import { createStrategyPortal } from './create'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function mainStrategyPortal() {
    // Clear console
    console.clear()

    // Define back and portal return params
    let back = false
    let portalReturn: DataReturn = { error: false, data: '' }

    // Define choices for strategy screen
    const choices = [
        '🏃 Run Trading Strategy',
        '🔮 Run Trading Strategy (more options)',
        '💡 Create Trading Strategy',
        '❌ Delete Trading Strategy',
        '👈 Back'
    ]

    while (!back) {
        // Show header 
        headerStrategies()

        // Handle portal return
        if (portalReturn.data !== '') await handlePortalReturn(portalReturn)

        // Interact with user
        const choiceCLI = await interactCLI({
            type: 'autocomplete',
            message: 'Choose what to do:',
            choices
        })

        let shouldClear = true

        // Choose which route to go
        if (choiceCLI.includes('🏃')) {
            portalReturn = await runStrategyPortal(true)
            if (portalReturn.error) shouldClear = false
        }
        else if (choiceCLI.includes('🔮')) {
            portalReturn = await runStrategyPortal(false)
            if (portalReturn.error) shouldClear = false
        }
        else if (choiceCLI.includes('💡')) portalReturn = await createStrategyPortal()
        else if (choiceCLI.includes('❌')) portalReturn = await deleteStrategyPortal()
        else if (choiceCLI.includes('👈')) {
            back = true
            portalReturn.error = false
            portalReturn.data = ''
        }

        // Clear console
        if (shouldClear) console.clear()
    }
    return portalReturn
}
