/**
 * Task Priority Queue System
 *
 * You are implementing a simple task management system that processes tasks based on priority.
 * Tasks have different priority levels and the system should handle task completion and priority updates.
 *
 * Rules:
 * - Tasks have a priority from 1-5 (1 = highest priority, 5 = lowest)
 * - Tasks can be added, completed, or have their priority changed
 * - When getting the next task, return the highest priority task (lowest number)
 * - If multiple tasks have the same priority, return the one added first (FIFO)
 * - Invalid operations (completing non-existent tasks, invalid priorities) generate error messages
 *
 * Input: Array of operations
 * Operations: 
 *   ["add", taskId: string, priority: number, description: string]
 *   ["complete", taskId: string] 
 *   ["update", taskId: string, newPriority: number]
 *   ["next"] - get next task to work on
 *
 * Return: Object with current task queue and array of results/errors
 * { queue: Array<{id: string, priority: number, description: string}>, results: string[], errors: string[] }
 *
 * Example:
 * Operations: [["add", "TASK1", 2, "Fix bug"], ["add", "TASK2", 1, "Critical issue"], ["next"]]
 * Returns: { queue: [{"id": "TASK2", "priority": 1, "description": "Critical issue"}, {"id": "TASK1", "priority": 2, "description": "Fix bug"}], results: ["TASK2"], errors: [] }
 */

type Status = 'add' | 'complete' | 'update' | 'next'
type Add = [Status, string, number, string]
type Complete = [Status, string]
type Update = [Status, string, number]
type Next = [Status]
type Operation = Add | Complete | Update | Next

type OutputTask = { 'id': string, 'priority': number, 'description': string }
type Output = { 'queue': OutputTask[], 'results': string[], 'errors': string[] }

function handleAdd(operation, output) {
    const [, taskId, priority, description] = operation
    if (!output.queue.map(task => task.id).includes(taskId)) {
        output.queue.push({ id: taskId, priority: priority, description: description })
    } else {
        output.errors.push(`${taskId} is already on the list`)
    }
}

function handleComplete(taskId, output) {
    if (output.queue.map(task => task.id).includes(taskId)) {
        output.results.push(taskId)
        const taskQueueIndex = output.queue.map(task => task.id).indexOf(taskId)
        output.queue.splice(taskQueueIndex, 1)
    } else {
        output.errors.push(`${taskId} is not on the list`)
    }
}

function handleUpdate(operation, output) {
    const [, taskId, newPriority] = operation
    if (output.queue.map(task => task.id).includes(taskId)) {
        const taskQueueIndex = output.queue.map(task => task.id).indexOf(taskId)
        output.queue[taskQueueIndex].priority = newPriority
    } else {
        output.errors.push(`${taskId} is not on the list`)
    }
}

function handleNext(output) {
    if (output.queue.length != 0) {
        const priorities = output.queue.map(task => task.priority)
        const minPriority = Math.min(...priorities)
        const minPriorityIndex = priorities.indexOf(Math.min(...priorities))
        handleComplete(output.queue[minPriorityIndex].id, output)
    } else {
        output.errors.push(`Queue is empty`)
    }
}

export function processTaskOperations(operations: Operation[]): Output {
    let output: Output = { 'queue': [], 'results': [], 'errors': [] }

    operations.forEach(operation => {
        if (operation[0] === 'add') {
            handleAdd(operation, output)
        } else if (operation[0] === 'complete') {
            handleComplete(operation[1], output)
        } else if (operation[0] === 'update') {
            handleUpdate(operation, output)
        } else if (operation[0] === 'next') {
            handleNext(output)
        }
    })

    return output
}