/**
 * Simple Inventory Tracker
 *
 * You are implementing a basic inventory tracking system for a small store.
 * The system processes a list of operations (add, remove, check) and tracks
 * the current stock levels for different items.
 *
 * Rules:
 * - Items start with 0 stock unless explicitly added
 * - Remove operations fail if insufficient stock (record as error)
 * - Stock cannot go below 0
 * - All operations are processed in order
 *
 * Input: Array of operations
 * Operations: { action: "add" | "remove" | "check", item: string, quantity: number }
 * - "add": increases stock by quantity
 * - "remove": decreases stock by quantity (fails if insufficient)
 * - "check": returns current stock level
 *
 * Output: Object with final inventory and operation results
 * {
 *   inventory: { [item: string]: number },  // final stock levels
 *   results: Array<{ success: boolean, stock?: number, error?: string }>,  // one per operation
 *   totalOperations: number,
 *   successfulOperations: number
 * }
 *
 * Example:
 * Operations: [
 *   { action: "add", item: "apple", quantity: 10 },
 *   { action: "remove", item: "apple", quantity: 3 },
 *   { action: "check", item: "apple", quantity: 0 },
 *   { action: "remove", item: "banana", quantity: 5 }
 * ]
 * Result: inventory has apple: 7, results show success/failure for each operation
 */

function handleAction(item: string, quantity: number, output: Output) {
    
    if (output.inventory[item] === undefined) {
        output.inventory[item] = quantity
    } else {
        output.inventory[item] += quantity
    }

    output.results.push({success: true, stock: output.inventory[item]})
    output.totalOperations += 1
    output.successfulOperations += 1

    return output
}

function handleRemove(item: string, quantity: number, output: Output) {
    if (output.inventory[item] === undefined || output.inventory[item] < quantity) {
        output.results.push({success: false, stock: output.inventory[item], error: 'insufficient stock'})
    } else {
        output.inventory[item] -= quantity
        output.results.push({success: true, stock: output.inventory[item]})
        output.successfulOperations += 1
    }

    output.totalOperations += 1

    return output
}

function handleCheck(item: string, output: Output) {
    if (output.inventory[item] === undefined || output.inventory[item] === 0) {
        output.results.push({success: true, stock: 0})
    } else { 
        output.results.push({success: true, stock: output.inventory[item]})
    }

    output.totalOperations += 1
    output.successfulOperations += 1

    return output
}

type Output = {
    inventory: { [item: string]: number }
    results: Array<{ success: boolean, stock?: number, error?: string }>
    totalOperations: number
    successfulOperations: number
}

export function processInventory(operations: Array<{ action: "add" | "remove" | "check", item: string, quantity: number }>): Output {
    let output: Output = {
        inventory: {},
        results: [],
        totalOperations: 0,
        successfulOperations: 0
    }

    operations.forEach(operation => {
        if (operation.action === 'add') {
            output = handleAction(operation.item, operation.quantity, output)
        } else if (operation.action === 'remove') {
            output = handleRemove(operation.item, operation.quantity, output)
        } else if (operation.action === 'check') {
            output = handleCheck(operation.item, output)
        }
    })

    return output
}