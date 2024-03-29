// ---------------------------------------------------- 
// |                PRISMA RESULT HELPERS             |
// ---------------------------------------------------- 

// ---------------------------------------------------- 
// |                     GLOBALS                      |
// ---------------------------------------------------- 

// Define imports
import { StrategyResultMulti } from "../infra/interfaces"
import { PrismaClient } from "@prisma/client"

// Define the prisma client
const prisma = new PrismaClient()

// ---------------------------------------------------- 
// |                   FUNCTIONS                      |
// ---------------------------------------------------- 

export async function insertMultiResult(result: StrategyResultMulti): Promise<{ error: boolean, data: string }> {
    try {
        await prisma.strategyResultMulti.create({
            data: {
                ...result,
                symbols: JSON.stringify(result.symbols),
                params: JSON.stringify(result.params),
                multiResults: JSON.stringify(result.multiResults),
                startTime: BigInt(result.startTime),
                endTime: BigInt(result.endTime)
            },
        });
        return { error: false, data: `Successfully inserted multi value result: ${result.name}` }
    } catch (error) {
        return { error: true, data: `Problem inserting result with error: ${error}` }
    }
}

export async function getAllMultiResults(): Promise<{ error: boolean, data: string | string[] }> {
    try {
        // Get all the strategies names
        const strategyResults = await prisma.strategyResultMulti.findMany({
            select: { name: true }
        })

        const names = strategyResults.map(result => result.name)
        return { error: false, data: names }
    } catch (error) {
        return { error: true, data: `Problem getting results with error: ${error}` }
    }
}

export async function getMultiResult(name: string): Promise<{ error: boolean, data: string | StrategyResultMulti }> {
    try {
        const result = await prisma.strategyResultMulti.findUnique({
            where: { name },
        });

        if (!result) {
            return { error: true, data: `Failed to find multi value result named ${name}` };
        }

        // Parse the JSON strings back into objects
        const parsedResult: StrategyResultMulti = {
            ...result,
            symbols: JSON.parse(result.symbols),
            params: JSON.parse(result.params),
            multiResults: JSON.parse(result.multiResults),
            startTime: Number(result.startTime),
            endTime: Number(result.endTime),
        };

        return { error: false, data: parsedResult };
    } catch (error) {
        return { error: true, data: `Failed to get result with error ${error}` }
    }
}

export async function deleteMultiResult(name: string): Promise<{ error: boolean, data: string }> {
    try {
        await prisma.strategyResultMulti.delete({
            where: { name },
        });

        // Return successfully deleted
        return { error: false, data: `Successfully deleted ${name}` }
    } catch (error) {
        return { error: true, data: `Failed to delete StrategyResult with name: ${name}. Error: ${error}` }
    }
}

