import { describe, it, expect } from 'vitest'
import { processScoreOperations } from './Scores'

describe('processScoreOperations', () => {
    describe('basic operations', () => {
        it('should handle add operation for new player', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ alice: 100 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(1)
        })

        it('should handle add operation for existing player', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 },
                { action: 'add' as const, player: 'alice', points: 50 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ alice: 150 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(2)
        })

        it('should handle subtract operation for new player', () => {
            const operations = [
                { action: 'subtract' as const, player: 'bob', points: 30 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ bob: -30 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(1)
        })

        it('should handle subtract operation for existing player', () => {
            const operations = [
                { action: 'add' as const, player: 'bob', points: 100 },
                { action: 'subtract' as const, player: 'bob', points: 30 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ bob: 70 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(2)
        })

        it('should handle set operation for new player', () => {
            const operations = [
                { action: 'set' as const, player: 'charlie', points: 200 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ charlie: 200 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(1)
        })

        it('should handle set operation for existing player', () => {
            const operations = [
                { action: 'add' as const, player: 'charlie', points: 100 },
                { action: 'set' as const, player: 'charlie', points: 200 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ charlie: 200 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(2)
        })

        it('should handle reset operation for new player', () => {
            const operations = [
                { action: 'reset' as const, player: 'david', points: 0 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ david: 0 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(1)
        })

        it('should handle reset operation for existing player', () => {
            const operations = [
                { action: 'add' as const, player: 'david', points: 100 },
                { action: 'reset' as const, player: 'david', points: 0 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ david: 0 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(2)
        })
    })

    describe('multiple players', () => {
        it('should handle multiple players with different operations', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 },
                { action: 'add' as const, player: 'bob', points: 150 },
                { action: 'subtract' as const, player: 'alice', points: 30 },
                { action: 'set' as const, player: 'charlie', points: 200 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({
                alice: 70,
                bob: 150,
                charlie: 200
            })
            expect(result.totalPlayers).toBe(3)
            expect(result.totalOperations).toBe(4)
        })

        it('should handle same player multiple times', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 50 },
                { action: 'add' as const, player: 'alice', points: 25 },
                { action: 'subtract' as const, player: 'alice', points: 10 },
                { action: 'add' as const, player: 'alice', points: 15 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ alice: 80 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(4)
        })
    })

    describe('edge cases', () => {
        it('should handle empty operations array', () => {
            const operations: any[] = []

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({})
            expect(result.totalPlayers).toBe(0)
            expect(result.totalOperations).toBe(0)
        })

        it('should handle zero points', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 0 },
                { action: 'subtract' as const, player: 'bob', points: 0 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ alice: 0, bob: 0 })
            expect(result.totalPlayers).toBe(2)
            expect(result.totalOperations).toBe(2)
        })

        it('should handle negative points in add operation', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: -50 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ alice: -50 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(1)
        })

        it('should handle negative points in subtract operation', () => {
            const operations = [
                { action: 'subtract' as const, player: 'alice', points: -50 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ alice: 50 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(1)
        })

        it('should handle large numbers', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 1000000 },
                { action: 'subtract' as const, player: 'alice', points: 500000 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ alice: 500000 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(2)
        })
    })

    describe('return object structure', () => {
        it('should return correct object structure', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 },
                { action: 'add' as const, player: 'bob', points: 150 }
            ]

            const result = processScoreOperations(operations)

            expect(result).toHaveProperty('scores')
            expect(result).toHaveProperty('leaderboard')
            expect(result).toHaveProperty('totalPlayers')
            expect(result).toHaveProperty('totalOperations')

            expect(typeof result.scores).toBe('object')
            expect(Array.isArray(result.leaderboard)).toBe(true)
            expect(typeof result.totalPlayers).toBe('number')
            expect(typeof result.totalOperations).toBe('number')
        })

        it('should have correct totalPlayers count', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 },
                { action: 'add' as const, player: 'bob', points: 150 },
                { action: 'add' as const, player: 'charlie', points: 200 }
            ]

            const result = processScoreOperations(operations)

            expect(result.totalPlayers).toBe(3)
        })

        it('should have correct totalOperations count', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 },
                { action: 'subtract' as const, player: 'alice', points: 30 },
                { action: 'set' as const, player: 'bob', points: 200 },
                { action: 'reset' as const, player: 'charlie', points: 0 }
            ]

            const result = processScoreOperations(operations)

            expect(result.totalOperations).toBe(4)
        })
    })

    describe('leaderboard', () => {
        it('should include leaderboard property', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 }
            ]

            const result = processScoreOperations(operations)

            expect(result.leaderboard).toBeDefined()
            expect(Array.isArray(result.leaderboard)).toBe(true)
        })

        it('should handle leaderboard for single player', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 }
            ]

            const result = processScoreOperations(operations)

            expect(result.leaderboard).toBeDefined()
        })

        it('should handle leaderboard for multiple players', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 },
                { action: 'add' as const, player: 'bob', points: 150 },
                { action: 'add' as const, player: 'charlie', points: 200 }
            ]

            const result = processScoreOperations(operations)

            expect(result.leaderboard).toBeDefined()
        })
    })

    describe('complex scenarios', () => {
        it('should handle mixed operations for multiple players', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 },
                { action: 'add' as const, player: 'bob', points: 150 },
                { action: 'subtract' as const, player: 'alice', points: 30 },
                { action: 'set' as const, player: 'charlie', points: 200 },
                { action: 'reset' as const, player: 'david', points: 0 },
                { action: 'add' as const, player: 'eve', points: 75 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({
                alice: 70,
                bob: 150,
                charlie: 200,
                david: 0,
                eve: 75
            })
            expect(result.totalPlayers).toBe(5)
            expect(result.totalOperations).toBe(6)
        })

        it('should handle player with all operation types', () => {
            const operations = [
                { action: 'add' as const, player: 'alice', points: 100 },
                { action: 'subtract' as const, player: 'alice', points: 20 },
                { action: 'set' as const, player: 'alice', points: 200 },
                { action: 'reset' as const, player: 'alice', points: 0 }
            ]

            const result = processScoreOperations(operations)

            expect(result.scores).toEqual({ alice: 0 })
            expect(result.totalPlayers).toBe(1)
            expect(result.totalOperations).toBe(4)
        })
    })
})
