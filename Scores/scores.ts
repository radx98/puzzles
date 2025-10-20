/**
 * Game Score Tracker
 *
 * You are implementing a simple score tracking system for a multiplayer game.
 * Players can earn points, lose points, or reset their scores. The system tracks
 * the current leaderboard and processes score changes in order.
 *
 * Rules:
 * - Players start with 0 points unless explicitly set
 * - Score changes are applied immediately
 * - Leaderboard shows players sorted by score (highest first)
 * - Ties are broken by player name (alphabetical order)
 * - All operations are processed in sequence
 *
 * Input: Array of score operations
 * Operations: { action: "add" | "subtract" | "set" | "reset", player: string, points: number }
 * - "add": increases player's score by points
 * - "subtract": decreases player's score by points (can go negative)
 * - "set": sets player's score to exactly points
 * - "reset": sets player's score to 0
 *
 * Output: Object with current scores and leaderboard
 * {
 *   scores: { [player: string]: number },  // current score for each player
 *   leaderboard: Array<{ player: string, score: number }>,  // sorted by score (desc), then name (asc)
 *   totalPlayers: number,
 *   totalOperations: number
 * }
 *
 * Example:
 * Operations: [
 *   { action: "add", player: "alice", points: 100 },
 *   { action: "add", player: "bob", points: 150 },
 *   { action: "subtract", player: "alice", points: 30 },
 *   { action: "set", player: "charlie", points: 200 }
 * ]
 * Result: alice: 70, bob: 150, charlie: 200, leaderboard shows charlie, bob, alice
 */

export function processScoreOperations(operations: Array<{ action: "add" | "subtract" | "set" | "reset", player: string, points: number }>): any {
    let scores = {}
    
    operations.forEach(operation => {
        if (operation.action === 'add') {
            if (scores[operation.player] === undefined) {
                scores[operation.player] = operation.points
            } else {
                scores[operation.player] += operation.points
            }
        } else if (operation.action === 'subtract') {
            if (scores[operation.player] === undefined) {
                scores[operation.player] = 0 - operation.points
            } else {
                scores[operation.player] -= operation.points
            }
        } else if (operation.action === 'set') {
            scores[operation.player] = operation.points
        } else {
            scores[operation.player] = 0
        }
    })

    const scoresKeys = Object.keys(scores)
    const scoresKeysSorted = scoresKeys.sort()
    const scoresToLeaderboardUnsorted = scoresKeysSorted.map(name => ({player: [name], score: scores[name]}))
    const leaderboard = scoresToLeaderboardUnsorted.sort((a, b) => b.score - a.score)

    const totalPlayers = Object.keys(scores).length
    const totalOperations = operations.length

    return {
        scores: scores,
        leaderboard: leaderboard,
        totalPlayers: totalPlayers,
        totalOperations: totalOperations
    }
}
