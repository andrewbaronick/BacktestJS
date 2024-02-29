// ---------------------------------------------------- 
// |                     HEADERS                      |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

import { colorHeader } from './colors'

// ---------------------------------------------------- 
// |                  EXPORTED HEADERS                |
// ---------------------------------------------------- 

function createHeader(stars: string, title: string) {
    const bar = ' ------------------------------------------------------------------'
    console.log(colorHeader(`
    ${bar}
    ${stars}
    ${title}
    ${stars}
    ${bar}
    `))
}

export function headerMain() {
    createHeader(
        '|                          *******************                     |',
        '|                          * BACKTESTJS HOME *                     |'
    )
}

export function headerHistoricalData() {
    createHeader(
        '|                     **************************                   |',
        '|                     * HISTORICAL CANDLE DATA *                   |'
    )
}

export function headerViewHistoricalData() {
    createHeader(
        '|                  *******************************                 |',
        '|                  * VIEW HISTORICAL CANDLE DATA *                 |'
    )
}

export function headerDownloadHistoricalData() {
    createHeader(
        '|                ***********************************               |',
        '|                * DOWNLOAD HISTORICAL CANDLE DATA *               |'
    )
}

export function headerEditHistoricalData() {
    createHeader(
        '|                  *******************************                 |',
        '|                  * EDIT HISTORICAL CANDLE DATA *                 |'
    )
}

export function headerStrategies() {
    createHeader(
        '|                        **********************                    |',
        '|                        * TRADING STRATEGIES *                    |'
    )
}

export function headerCreateStrategy() {
    createHeader(
        '|                     ***************************                  |',
        '|                     * CREATE TRADING STRATEGY *                  |'
    )
}

export function headerRunStrategy() {
    createHeader(
        '|                     ************************                     |',
        '|                     * RUN TRADING STRATEGY *                     |'
    )
}

export function headerDeleteStrategy() {
    createHeader(
        '|                    ***************************                   |',
        '|                    * DELETE TRADING STRATEGY *                   |'
    )
}

export function headerImportCSV() {
    createHeader(
        '|                           **************                         |',
        '|                           * IMPORT CSV *                         |'
    )
}

export function headerStrategyResults() {
    createHeader(
        '|                    ****************************                  |',
        '|                    * TRADING STRATEGY RESULTS *                  |'
    )
}

export function headerResults() {
    createHeader(
        '|                      *************************                   |',
        '|                      * SAVED TRADING RESULTS *                   |'
    )
}