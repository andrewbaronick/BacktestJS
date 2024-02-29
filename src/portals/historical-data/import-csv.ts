// ---------------------------------------------------- 
// |                  IMPORT CSV PORTAL               |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define helper imports
import { getAllCandleMetaData } from '../../helpers/prisma-historical-data'
import { intervals } from '../../helpers/historical-data'
import { interactCLI } from '../../helpers/portals'
import { importCSV } from '../../helpers/csv'

// Define infra imports
import { headerImportCSV } from '../../infra/headers'
import { MetaCandle } from '../../infra/interfaces'

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function importCSVPortal() {
    // Clear console
    console.clear()

    // Get historical metaData
    const metaData = await getAllCandleMetaData()
    if (metaData.error) return metaData

    // Show header 
    headerImportCSV()

    // Request base name from user
    const base = (await interactCLI({
        type: 'input',
        message: 'Base name (EX: BTC in BTCUSDT or APPL in APPL/USD):'
    })).toUpperCase()

    // Request quote name from user
    const quote = (await interactCLI({
        type: 'input',
        message: 'Quote name (EX: USDT in BTCUSDT or USD in APPL/USD):'
    })).toUpperCase()

    // Request interval from user
    const interval = await interactCLI({
        type: 'autocomplete',
        message: 'Interval:',
        choices: intervals
    })

    // Validate entry does not already exist
    if (typeof metaData.data !== 'string' && metaData.data.some((meta: MetaCandle) => meta.name === `${base + quote}-${interval}`)) {
        return { error: true, data: `Entry already exists for ${base + quote} at the ${interval} interval, either edit or remove the existing entry` }
    }

    // Request path from user
    let path = await interactCLI({
        type: 'input',
        message: 'Full Path to CSV:'
    })

    // Trim path whitespace
    path = path.trim()

    // Remove path surrounding quotes if they exist
    if ((path.startsWith(`"`) && path.endsWith(`"`)) || (path.startsWith(`'`) && path.endsWith(`'`))) {
        path = path.substring(1, path.length - 1)
    }

    // Try to import the CSV
    return await importCSV({ interval, base, quote, path })
}