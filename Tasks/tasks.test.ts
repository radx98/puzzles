import { describe, it, expect } from 'vitest'
import { processTaskOperations } from './tasks'

// Import the types from tasks.ts
type Status = 'add' | 'complete' | 'update' | 'next'
type Add = [Status, string, number, string]
type Complete = [Status, string]
type Update = [Status, string, number]
type Next = [Status]
type Operation = Add | Complete | Update | Next

describe('processTaskOperations', () => {
    describe('add operation', () => {
        it('should add a valid task to the queue', () => {
            const operations: Operation[] = [['add', 'TASK1', 2, 'Fix bug']]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([{ id: 'TASK1', priority: 2, description: 'Fix bug' }])
            expect(result.results).toEqual([])
            expect(result.errors).toEqual([])
        })

        it('should add multiple tasks to the queue', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 2, 'Fix bug'],
                ['add', 'TASK2', 1, 'Critical issue'],
                ['add', 'TASK3', 3, 'Add feature']
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toHaveLength(3)
            expect(result.queue).toContainEqual({ id: 'TASK1', priority: 2, description: 'Fix bug' })
            expect(result.queue).toContainEqual({ id: 'TASK2', priority: 1, description: 'Critical issue' })
            expect(result.queue).toContainEqual({ id: 'TASK3', priority: 3, description: 'Add feature' })
        })

        it('should not add duplicate task IDs and return error', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 2, 'Fix bug'],
                ['add', 'TASK1', 3, 'Different description']
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toHaveLength(1)
            expect(result.queue[0]).toEqual({ id: 'TASK1', priority: 2, description: 'Fix bug' })
            expect(result.errors).toEqual(['TASK1 is already on the list'])
        })
    })

    describe('complete operation', () => {
        it('should complete an existing task and remove it from queue', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 2, 'Fix bug'],
                ['complete', 'TASK1']
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([])
            expect(result.results).toEqual(['TASK1'])
            expect(result.errors).toEqual([])
        })

        it('should return error when trying to complete non-existent task', () => {
            const operations: Operation[] = [['complete', 'TASK1']]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([])
            expect(result.results).toEqual([])
            expect(result.errors).toEqual(['TASK1 is not on the list'])
        })

        it('should complete multiple tasks', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 2, 'Fix bug'],
                ['add', 'TASK2', 1, 'Critical issue'],
                ['complete', 'TASK1'],
                ['complete', 'TASK2']
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([])
            expect(result.results).toEqual(['TASK1', 'TASK2'])
            expect(result.errors).toEqual([])
        })
    })

    describe('update operation', () => {
        it('should update priority of an existing task', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 2, 'Fix bug'],
                ['update', 'TASK1', 1]
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([{ id: 'TASK1', priority: 1, description: 'Fix bug' }])
            expect(result.results).toEqual([])
            expect(result.errors).toEqual([])
        })

        it('should return error when trying to update non-existent task', () => {
            const operations: Operation[] = [['update', 'TASK1', 1]]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([])
            expect(result.results).toEqual([])
            expect(result.errors).toEqual(['TASK1 is not on the list'])
        })

        it('should update multiple tasks', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 2, 'Fix bug'],
                ['add', 'TASK2', 3, 'Add feature'],
                ['update', 'TASK1', 1],
                ['update', 'TASK2', 4]
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toHaveLength(2)
            expect(result.queue).toContainEqual({ id: 'TASK1', priority: 1, description: 'Fix bug' })
            expect(result.queue).toContainEqual({ id: 'TASK2', priority: 4, description: 'Add feature' })
        })
    })

    describe('next operation', () => {
        it('should return and complete the highest priority task (lowest number)', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 3, 'Low priority'],
                ['add', 'TASK2', 1, 'High priority'],
                ['add', 'TASK3', 2, 'Medium priority'],
                ['next']
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toHaveLength(2)
            expect(result.queue).toContainEqual({ id: 'TASK1', priority: 3, description: 'Low priority' })
            expect(result.queue).toContainEqual({ id: 'TASK3', priority: 2, description: 'Medium priority' })
            expect(result.results).toEqual(['TASK2'])
            expect(result.errors).toEqual([])
        })

        it('should handle FIFO ordering for tasks with same priority', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 2, 'First task'],
                ['add', 'TASK2', 2, 'Second task'],
                ['add', 'TASK3', 1, 'Highest priority'],
                ['next']
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toHaveLength(2)
            expect(result.queue).toContainEqual({ id: 'TASK1', priority: 2, description: 'First task' })
            expect(result.queue).toContainEqual({ id: 'TASK2', priority: 2, description: 'Second task' })
            expect(result.results).toEqual(['TASK3'])
        })

        it('should return error when trying to get next from empty queue', () => {
            const operations: Operation[] = [['next']]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([])
            expect(result.results).toEqual([])
            expect(result.errors).toEqual(['Queue is empty'])
        })

        it('should get next task after completing one', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 2, 'Task 1'],
                ['add', 'TASK2', 1, 'Task 2'],
                ['next'],
                ['next']
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([])
            expect(result.results).toEqual(['TASK2', 'TASK1'])
            expect(result.errors).toEqual([])
        })
    })

    describe('complex scenarios', () => {
        it('should handle mixed operations correctly', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 3, 'Fix bug'],
                ['add', 'TASK2', 1, 'Critical issue'],
                ['update', 'TASK1', 2],
                ['next'],
                ['complete', 'TASK1']
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([])
            expect(result.results).toEqual(['TASK2', 'TASK1'])
            expect(result.errors).toEqual([])
        })

        it('should handle errors gracefully in mixed operations', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 2, 'Fix bug'],
                ['complete', 'TASK2'], // Error: TASK2 not on list
                ['update', 'TASK3', 1], // Error: TASK3 not on list
                ['add', 'TASK1', 3, 'Different description'], // Error: duplicate
                ['next'],
                ['next'] // Error: queue empty
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([])
            expect(result.results).toEqual(['TASK1'])
            expect(result.errors).toEqual([
                'TASK2 is not on the list',
                'TASK3 is not on the list',
                'TASK1 is already on the list',
                'Queue is empty'
            ])
        })
    })

    describe('edge cases', () => {
        it('should handle empty operations array', () => {
            const operations: Operation[] = []
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([])
            expect(result.results).toEqual([])
            expect(result.errors).toEqual([])
        })

        it('should handle single task operations', () => {
            const operations: Operation[] = [['add', 'SINGLE_TASK', 5, 'Only task']]
            const result = processTaskOperations(operations)

            expect(result.queue).toEqual([{ id: 'SINGLE_TASK', priority: 5, description: 'Only task' }])
            expect(result.results).toEqual([])
            expect(result.errors).toEqual([])
        })

        it('should handle priority range 1-5', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 1, 'Highest priority'],
                ['add', 'TASK2', 5, 'Lowest priority'],
                ['add', 'TASK3', 3, 'Middle priority']
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toHaveLength(3)
            expect(result.queue).toContainEqual({ id: 'TASK1', priority: 1, description: 'Highest priority' })
            expect(result.queue).toContainEqual({ id: 'TASK2', priority: 5, description: 'Lowest priority' })
            expect(result.queue).toContainEqual({ id: 'TASK3', priority: 3, description: 'Middle priority' })
        })

        it('should maintain queue order after multiple operations', () => {
            const operations: Operation[] = [
                ['add', 'TASK1', 2, 'Task 1'],
                ['add', 'TASK2', 1, 'Task 2'],
                ['add', 'TASK3', 2, 'Task 3'],
                ['add', 'TASK4', 1, 'Task 4'],
                ['update', 'TASK1', 1],
                ['complete', 'TASK2']
            ]
            const result = processTaskOperations(operations)

            expect(result.queue).toHaveLength(3)
            expect(result.results).toEqual(['TASK2'])
            expect(result.errors).toEqual([])
        })
    })
})
