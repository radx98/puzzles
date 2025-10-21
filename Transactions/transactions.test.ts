import { describe, it, expect } from 'vitest'
import { processTransactions } from './transactions'

describe('processTransactions', () => {
    it('should handle empty transactions array', () => {
        const result = processTransactions([])

        expect(result).toEqual({
            balances: {},
            results: [],
            totalTransactions: 0,
            successfulTransactions: 0
        })
    })

    it('should handle deposit to new account', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 100 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 100
        })
        expect(result.results).toHaveLength(1)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.totalTransactions).toBe(1)
        expect(result.successfulTransactions).toBe(1)
    })

    it('should handle multiple deposits to same account', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 100 },
            { type: 'deposit', account: 'alice', amount: 50 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 150
        })
        expect(result.results).toHaveLength(2)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.results[1]).toEqual({ success: true })
        expect(result.totalTransactions).toBe(2)
        expect(result.successfulTransactions).toBe(2)
    })

    it('should handle deposits to multiple accounts', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 100 },
            { type: 'deposit', account: 'bob', amount: 200 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 100,
            bob: 200
        })
        expect(result.results).toHaveLength(2)
        expect(result.totalTransactions).toBe(2)
        expect(result.successfulTransactions).toBe(2)
    })

    it('should handle successful withdrawal with sufficient balance', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 100 },
            { type: 'withdraw', account: 'alice', amount: 30 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 70
        })
        expect(result.results).toHaveLength(2)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.results[1]).toEqual({ success: true })
        expect(result.totalTransactions).toBe(2)
        expect(result.successfulTransactions).toBe(2)
    })

    it('should fail withdrawal with insufficient balance', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 50 },
            { type: 'withdraw', account: 'alice', amount: 100 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 50
        })
        expect(result.results).toHaveLength(2)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.results[1]).toEqual({
            success: false,
            error: 'alice balance is low'
        })
        expect(result.totalTransactions).toBe(2)
        expect(result.successfulTransactions).toBe(1)
    })

    it('should fail withdrawal from non-existent account', () => {
        const transactions = [
            { type: 'withdraw', account: 'alice', amount: 50 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({})
        expect(result.results).toHaveLength(1)
        expect(result.results[0]).toEqual({
            success: false,
            error: "alice doesn't exist"
        })
        expect(result.totalTransactions).toBe(1)
        expect(result.successfulTransactions).toBe(0)
    })

    it('should handle successful transfer between accounts', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 100 },
            { type: 'deposit', account: 'bob', amount: 50 },
            { type: 'transfer', from: 'alice', to: 'bob', amount: 20 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 80,
            bob: 70
        })
        expect(result.results).toHaveLength(3)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.results[1]).toEqual({ success: true })
        expect(result.results[2]).toEqual({ success: true })
        expect(result.totalTransactions).toBe(3)
        expect(result.successfulTransactions).toBe(3)
    })

    it('should fail transfer with insufficient balance in source account', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 30 },
            { type: 'deposit', account: 'bob', amount: 50 },
            { type: 'transfer', from: 'alice', to: 'bob', amount: 100 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 30,
            bob: 50
        })
        expect(result.results).toHaveLength(3)
        expect(result.results[2]).toEqual({
            success: false,
            error: 'alice balance is low'
        })
        expect(result.totalTransactions).toBe(3)
        expect(result.successfulTransactions).toBe(2)
    })

    it('should fail transfer when source account does not exist', () => {
        const transactions = [
            { type: 'deposit', account: 'bob', amount: 50 },
            { type: 'transfer', from: 'alice', to: 'bob', amount: 20 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            bob: 50
        })
        expect(result.results).toHaveLength(2)
        expect(result.results[1]).toEqual({
            success: false,
            error: "alice doesn't exist"
        })
        expect(result.totalTransactions).toBe(2)
        expect(result.successfulTransactions).toBe(1)
    })

    it('should create destination account if it does not exist during transfer', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 100 },
            { type: 'transfer', from: 'alice', to: 'bob', amount: 20 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 80,
            bob: 20
        })
        expect(result.results).toHaveLength(2)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.results[1]).toEqual({ success: true })
        expect(result.totalTransactions).toBe(2)
        expect(result.successfulTransactions).toBe(2)
    })

    it('should fail transfer when neither account exists', () => {
        const transactions = [
            { type: 'transfer', from: 'alice', to: 'bob', amount: 20 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({})
        expect(result.results).toHaveLength(1)
        expect(result.results[0]).toEqual({
            success: false,
            error: "alice doesn't exist"
        })
        expect(result.totalTransactions).toBe(1)
        expect(result.successfulTransactions).toBe(0)
    })

    it('should handle the example from documentation', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 100 },
            { type: 'withdraw', account: 'alice', amount: 30 },
            { type: 'transfer', from: 'alice', to: 'bob', amount: 20 },
            { type: 'withdraw', account: 'alice', amount: 100 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 50,
            bob: 20
        })
        expect(result.results).toHaveLength(4)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.results[1]).toEqual({ success: true })
        expect(result.results[2]).toEqual({ success: true })
        expect(result.results[3]).toEqual({
            success: false,
            error: 'alice balance is low'
        })
        expect(result.totalTransactions).toBe(4)
        expect(result.successfulTransactions).toBe(3)
    })

    it('should handle complex sequence of mixed transactions', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 500 },
            { type: 'deposit', account: 'bob', amount: 300 },
            { type: 'deposit', account: 'charlie', amount: 100 },
            { type: 'withdraw', account: 'alice', amount: 50 },
            { type: 'transfer', from: 'bob', to: 'charlie', amount: 100 },
            { type: 'withdraw', account: 'charlie', amount: 300 },
            { type: 'transfer', from: 'alice', to: 'bob', amount: 200 },
            { type: 'withdraw', account: 'unknown', amount: 10 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 250,
            bob: 400,
            charlie: 200
        })
        expect(result.results).toHaveLength(8)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.results[1]).toEqual({ success: true })
        expect(result.results[2]).toEqual({ success: true })
        expect(result.results[3]).toEqual({ success: true })
        expect(result.results[4]).toEqual({ success: true })
        expect(result.results[5]).toEqual({
            success: false,
            error: 'charlie balance is low'
        })
        expect(result.results[6]).toEqual({ success: true })
        expect(result.results[7]).toEqual({
            success: false,
            error: "unknown doesn't exist"
        })
        expect(result.totalTransactions).toBe(8)
        expect(result.successfulTransactions).toBe(6)
    })

    it('should handle withdrawing exact balance', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 100 },
            { type: 'withdraw', account: 'alice', amount: 100 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 0
        })
        expect(result.results).toHaveLength(2)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.results[1]).toEqual({ success: true })
        expect(result.totalTransactions).toBe(2)
        expect(result.successfulTransactions).toBe(2)
    })

    it('should handle transferring exact balance', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 100 },
            { type: 'deposit', account: 'bob', amount: 50 },
            { type: 'transfer', from: 'alice', to: 'bob', amount: 100 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 0,
            bob: 150
        })
        expect(result.results).toHaveLength(3)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.results[1]).toEqual({ success: true })
        expect(result.results[2]).toEqual({ success: true })
        expect(result.totalTransactions).toBe(3)
        expect(result.successfulTransactions).toBe(3)
    })

    it('should handle zero amount transactions', () => {
        const transactions = [
            { type: 'deposit', account: 'alice', amount: 0 },
            { type: 'deposit', account: 'alice', amount: 100 },
            { type: 'withdraw', account: 'alice', amount: 0 }
        ]

        const result = processTransactions(transactions)

        expect(result.balances).toEqual({
            alice: 100
        })
        expect(result.results).toHaveLength(3)
        expect(result.results[0]).toEqual({ success: true })
        expect(result.results[1]).toEqual({ success: true })
        expect(result.results[2]).toEqual({ success: true })
        expect(result.totalTransactions).toBe(3)
        expect(result.successfulTransactions).toBe(3)
    })
})

