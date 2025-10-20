import { describe, it, expect } from 'vitest'
import { processInventory } from './inventory'

describe('processInventory', () => {
    it('should handle empty operations array', () => {
        const result = processInventory([])

        expect(result).toEqual({
            inventory: {},
            results: [],
            totalOperations: 0,
            successfulOperations: 0
        })
    })

    it('should add items to inventory', () => {
        const operations = [
            { action: 'add', item: 'apple', quantity: 10 },
            { action: 'add', item: 'banana', quantity: 5 }
        ]

        const result = processInventory(operations)

        expect(result.inventory).toEqual({
            apple: 10,
            banana: 5
        })
        expect(result.results).toHaveLength(2)
        expect(result.results[0]).toEqual({ success: true, stock: 10 })
        expect(result.results[1]).toEqual({ success: true, stock: 5 })
        expect(result.totalOperations).toBe(2)
        expect(result.successfulOperations).toBe(2)
    })

    it('should remove items from inventory when sufficient stock', () => {
        const operations = [
            { action: 'add', item: 'apple', quantity: 10 },
            { action: 'remove', item: 'apple', quantity: 3 }
        ]

        const result = processInventory(operations)

        expect(result.inventory).toEqual({
            apple: 7
        })
        expect(result.results).toHaveLength(2)
        expect(result.results[0]).toEqual({ success: true, stock: 10 })
        expect(result.results[1]).toEqual({ success: true, stock: 7 })
        expect(result.totalOperations).toBe(2)
        expect(result.successfulOperations).toBe(2)
    })

    it('should fail remove operation when insufficient stock', () => {
        const operations = [
            { action: 'add', item: 'apple', quantity: 5 },
            { action: 'remove', item: 'apple', quantity: 10 }
        ]

        const result = processInventory(operations)

        expect(result.inventory).toEqual({
            apple: 5
        })
        expect(result.results).toHaveLength(2)
        expect(result.results[0]).toEqual({ success: true, stock: 5 })
        expect(result.results[1]).toEqual({
            success: false,
            stock: 5,
            error: 'insufficient stock'
        })
        expect(result.totalOperations).toBe(2)
        expect(result.successfulOperations).toBe(1)
    })

    it('should fail remove operation when item does not exist', () => {
        const operations = [
            { action: 'remove', item: 'nonexistent', quantity: 5 }
        ]

        const result = processInventory(operations)

        expect(result.inventory).toEqual({})
        expect(result.results).toHaveLength(1)
        expect(result.results[0]).toEqual({
            success: false,
            stock: undefined,
            error: 'insufficient stock'
        })
        expect(result.totalOperations).toBe(1)
        expect(result.successfulOperations).toBe(0)
    })

    it('should check stock levels', () => {
        const operations = [
            { action: 'add', item: 'apple', quantity: 10 },
            { action: 'check', item: 'apple', quantity: 0 },
            { action: 'check', item: 'nonexistent', quantity: 0 }
        ]

        const result = processInventory(operations)

        expect(result.inventory).toEqual({
            apple: 10
        })
        expect(result.results).toHaveLength(3)
        expect(result.results[0]).toEqual({ success: true, stock: 10 })
        expect(result.results[1]).toEqual({ success: true, stock: 10 })
        expect(result.results[2]).toEqual({ success: true, stock: 0 })
        expect(result.totalOperations).toBe(3)
        expect(result.successfulOperations).toBe(3)
    })

    it('should handle mixed operations in sequence', () => {
        const operations = [
            { action: 'add', item: 'apple', quantity: 10 },
            { action: 'remove', item: 'apple', quantity: 3 },
            { action: 'check', item: 'apple', quantity: 0 },
            { action: 'remove', item: 'banana', quantity: 5 },
            { action: 'add', item: 'banana', quantity: 2 }
        ]

        const result = processInventory(operations)

        expect(result.inventory).toEqual({
            apple: 7,
            banana: 2
        })
        expect(result.results).toHaveLength(5)
        expect(result.results[0]).toEqual({ success: true, stock: 10 })
        expect(result.results[1]).toEqual({ success: true, stock: 7 })
        expect(result.results[2]).toEqual({ success: true, stock: 7 })
        expect(result.results[3]).toEqual({
            success: false,
            stock: undefined,
            error: 'insufficient stock'
        })
        expect(result.results[4]).toEqual({ success: true, stock: 2 })
        expect(result.totalOperations).toBe(5)
        expect(result.successfulOperations).toBe(4)
    })

    it('should handle zero quantity operations', () => {
        const operations = [
            { action: 'add', item: 'apple', quantity: 0 },
            { action: 'remove', item: 'apple', quantity: 0 },
            { action: 'check', item: 'apple', quantity: 0 }
        ]

        const result = processInventory(operations)

        expect(result.inventory).toEqual({
            apple: 0
        })
        expect(result.results).toHaveLength(3)
        expect(result.results[0]).toEqual({ success: true, stock: 0 })
        expect(result.results[1]).toEqual({ success: true, stock: 0 })
        expect(result.results[2]).toEqual({ success: true, stock: 0 })
        expect(result.totalOperations).toBe(3)
        expect(result.successfulOperations).toBe(3)
    })

    it('should handle multiple items with same operations', () => {
        const operations = [
            { action: 'add', item: 'apple', quantity: 5 },
            { action: 'add', item: 'apple', quantity: 3 },
            { action: 'remove', item: 'apple', quantity: 2 }
        ]

        const result = processInventory(operations)

        expect(result.inventory).toEqual({
            apple: 6
        })
        expect(result.results).toHaveLength(3)
        expect(result.results[0]).toEqual({ success: true, stock: 5 })
        expect(result.results[1]).toEqual({ success: true, stock: 8 })
        expect(result.results[2]).toEqual({ success: true, stock: 6 })
        expect(result.totalOperations).toBe(3)
        expect(result.successfulOperations).toBe(3)
    })
})
