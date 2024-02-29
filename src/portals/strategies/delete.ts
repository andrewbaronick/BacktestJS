// ---------------------------------------------------- 
// |               DELETE STRATEGY PORTAL             |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { getAllStrategies, deleteStrategy } from '../../helpers/prisma-strategies'

// Define infra imports
import { colorChoice } from '../../infra/colors'
import { headerDeleteStrategy } from '../../infra/headers'
import { StrategyMeta } from '../../infra/interfaces'

// Define portal imports
import { interactCLI } from '../../helpers/portals'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function deleteStrategyPortal() {
    // Clear console
    console.clear()

    // Get and parse all strategy metaData
    let allStrategies = await getAllStrategies()
    if (allStrategies.error) return allStrategies
    let choices: string[] = []
    if (typeof allStrategies.data !== 'string') choices = allStrategies.data.map((strategy: StrategyMeta) => strategy.name)

    // Update if list is empty
    if (choices.length === 0) return { error: true, data: 'There are no saved strategies' }

    // Add back choice to choices
    choices.push('👈 ' + colorChoice('Back'))

    // Show header 
    headerDeleteStrategy()

    // Interact with user
    const choiceCLI = await interactCLI({
        type: 'autocomplete',
        message: 'Choose a trading strategy to delete:',
        choices
    })

    // Choose which flow to go
    if (choiceCLI.includes('👈')) return { error: false, data: '' }
    else {
        // Find user choice
        let strategyChoice = ''
        for (let i = 0; i < choices.length; i++) {
            if (choices[i] === choiceCLI) {
                strategyChoice = choices[i]
                break
            }
        }

        // Delete the strategy
        return await deleteStrategy(strategyChoice)
    }
}
