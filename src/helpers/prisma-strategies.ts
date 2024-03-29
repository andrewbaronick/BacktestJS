// ---------------------------------------------------- 
// |               PRISMA STRATEGY HELPERS            |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define imports
import { StrategyMeta } from "../infra/interfaces"
import { PrismaClient } from "@prisma/client"

// Define the prisma client
const prisma = new PrismaClient()

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function insertStrategy(strategy: StrategyMeta): Promise<{ error: boolean, data: string }> {
    try {
        // Insert a strategy
        await prisma.strategy.create({
            data: {
                ...strategy,
                params: JSON.stringify(strategy.params),
                creationTime: BigInt(strategy.creationTime),
                lastRunTime: BigInt(strategy.lastRunTime)
            }
        })
        return { error: false, data: `Successfully inserted strategy: ${strategy.name}` }
    } catch (error) {
        return { error: true, data: `Problem inserting strategy with error: ${error}` }
    }
}

export async function getAllStrategies(): Promise<{ error: boolean, data: StrategyMeta[] | string }> {
    try {
        // Get all the strategies
        const strategies = await prisma.strategy.findMany()
        const strategyMetas = strategies.map(strategy => ({
            ...strategy,
            params: JSON.parse(strategy.params),
            creationTime: Number(strategy.creationTime),
            lastRunTime: Number(strategy.lastRunTime)
        }))
        return { error: false, data: strategyMetas }
    } catch (error) {
        return { error: true, data: `Problem getting all strategies with error: ${error}` }
    }
}

export async function getStrategy(name: string): Promise<{ error: boolean, data: StrategyMeta | string }> {
    try {
        // Get a specific strategy
        const strategy = await prisma.strategy.findUnique({ where: { name } })
        if (!strategy) {
            return { error: true, data: `Strategy with name: ${name} not found` }
        }
        const strategyMeta = {
            ...strategy,
            params: JSON.parse(strategy.params),
            creationTime: Number(strategy.creationTime),
            lastRunTime: Number(strategy.lastRunTime)
        }
        return { error: false, data: strategyMeta }
    } catch (error) {
        return { error: true, data: `Problem getting strategy with error: ${error}` }
    }
}

export async function updateLastRunTime(name: string, lastRunTime: number): Promise<{ error: boolean, data: string }> {
    try {
        // Update the strategies last run time
        const strategy = await prisma.strategy.update({
            where: { name },
            data: { lastRunTime: BigInt(lastRunTime) }
        })
        return { error: false, data: `Successfully updated lastRunTime for strategy: ${strategy.name}` }
    } catch (error) {
        return { error: true, data: `Problem updating lastRunTime with error: ${error}` }
    }
}

export async function deleteStrategy(name: string): Promise<{ error: boolean, data: string }> {
    try {
        // Delete a strategy
        await prisma.strategy.delete({ where: { name } })
        return { error: false, data: `Successfully deleted strategy: ${name}` }
    } catch (error) {
        return { error: true, data: `Problem deleting strategy with error: ${error}` }
    }
}
