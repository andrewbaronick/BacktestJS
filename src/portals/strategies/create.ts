// ---------------------------------------------------- 
// |               CREATE STRATEGY PORTAL             |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { getAllStrategies, insertStrategy } from '../../helpers/prisma-strategies'
import { interactCLI } from '../../helpers/portals'

// Define infra imports
import { headerCreateStrategy } from '../../infra/headers'
import { StrategyMeta } from '../../infra/interfaces'
import { colorError } from '../../infra/colors'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

function isValidFunctionName(name: string) {
    // Return if starts with a number
    if (/^[0-9]/.test(name)) return 'Name cannot start with a number'

    // Name can contain only numbers, letters, underscores, and the dollar sign
    if (!/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name)) return 'Name can contain only numbers, letters, underscores, and the dollar sign'

    // Check for common reserved js / ts keywords
    const reservedKeywords = [
        "break", "case", "catch", "class", "const", "continue", "debugger",
        "default", "delete", "do", "else", "export", "extends", "finally",
        "for", "function", "if", "import", "in", "instanceof", "new",
        "return", "super", "switch", "this", "throw", "try", "typeof",
        "var", "void", "while", "with", "yield"
    ];
    if (reservedKeywords.includes(name)) return 'Cant use this name due it it being a reserved js / ts function name'

    // If none of the above conditions are met, the name is valid.
    return true
}

export async function createStrategyPortal() {
    // Clear console
    console.clear()

    // Define globals
    let valid = false
    let metaData: string[] = []

    // Get strategies
    let allStrategies = await getAllStrategies()
    if (allStrategies.error) return allStrategies
    if (typeof allStrategies.data !== 'string') metaData = allStrategies.data.map((strategy: StrategyMeta) => strategy.name)

    // Show header 
    headerCreateStrategy()

    // Define function globals
    let addParams = true
    let strategyName = ''
    let paramNames: string[] = []

    while (valid === false) {
        // Get name from user
        strategyName = await interactCLI({
            type: 'input',
            message: 'Trading Strategy Name:'
        })

        // Check that name is a valid function name
        const validateName = isValidFunctionName(strategyName)
        if (typeof validateName === 'string') {
            console.log(colorError(validateName))
        } else {
            // Validate if the strategy already exists
            valid = !metaData.includes(strategyName)
            if (!valid) console.log(colorError(`Strategy ${strategyName} already exists choose a different name`))
        }
    }
    // Get extra params from user
    while (addParams) {
        const addParamsInput = await interactCLI({
            type: 'autocomplete',
            message: 'Add Params:',
            choices: ['Yes', 'No']
        })
        if (addParamsInput === 'Yes') {
            const param = await interactCLI({
                type: 'input',
                message: 'Parameter Name:'
            })
            paramNames.push(param)
        } else addParams = false
    }

    const dynamicParamsInput = await interactCLI({
        type: 'autocomplete',
        message: 'Will the strategy include dynamic params (Usually No):',
        choices: ['No', 'Yes']
    })

    // Create metadata
    const meta = {
        name: strategyName,
        params: paramNames,
        dynamicParams: dynamicParamsInput === 'Yes' ? true : false,
        creationTime: new Date().getTime(),
        lastRunTime: 0
    }

    // Save the strategy
    const saveResults = await insertStrategy(meta)
    if (saveResults.error) return saveResults
    return { error: false, data: `Successfully saved the ${meta.name} strategy` }
}