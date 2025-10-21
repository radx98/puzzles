/**
 * Bank Account Transaction Processor
 *
 * You are implementing a simple bank account system that processes transactions
 * for multiple accounts. The system handles deposits, withdrawals, and transfers
 * between accounts.
 *
 * Rules:
 * - Accounts start with 0 balance unless a deposit is made
 * - Withdrawals fail if insufficient balance (balance cannot go negative)
 * - Transfers fail if the source account has insufficient balance
 * - All transactions are processed in order
 * - Failed transactions are recorded but don't change account balances
 *
 * Input: Array of transactions
 * Each transaction is one of:
 * - { type: "deposit", account: string, amount: number }
 * - { type: "withdraw", account: string, amount: number }
 * - { type: "transfer", from: string, to: string, amount: number }
 *
 * Output: Object with final balances and transaction results
 * {
 *   balances: { [account: string]: number },  // final balance for each account
 *   results: Array<{ success: boolean, error?: string }>,  // one per transaction
 *   totalTransactions: number,
 *   successfulTransactions: number
 * }
 *
 * Example:
 * Input: [
 *   { type: "deposit", account: "alice", amount: 100 },
 *   { type: "withdraw", account: "alice", amount: 30 },
 *   { type: "transfer", from: "alice", to: "bob", amount: 20 },
 *   { type: "withdraw", account: "alice", amount: 100 }
 * ]
 * Output: balances { alice: 50, bob: 20 }, last withdrawal fails with "insufficient balance"
 */

type Output = {
   balances: { [account: string]: number }
   results: Array<{ success: boolean, error?: string }>
   totalTransactions: number
   successfulTransactions: number
}

export function processTransactions(transactions: any[]): any {
    let output: Output = {
        balances: {},
        results: [],
        totalTransactions: 0,
        successfulTransactions: 0
    }

    transactions.forEach(transaction => {
        if (transaction.type === 'deposit') {
            if (output.balances[transaction.account] === undefined) {
                output.balances[transaction.account] = transaction.amount
            } else {
                output.balances[transaction.account] += transaction.amount
            }
            output.results.push({success: true})
            output.successfulTransactions += 1
        } else if (transaction.type === 'withdraw') {
            if (output.balances[transaction.account] === undefined) {
                output.results.push({success: false, error: `${transaction.account} doesn't exist`})
            } else if (output.balances[transaction.account] < transaction.amount) {
                output.results.push({success: false, error: `${transaction.account} balance is low`})
            } else {
                output.balances[transaction.account] -= transaction.amount
                output.results.push({success: true})
                output.successfulTransactions += 1
            }
        } else {
            if (output.balances[transaction.from] < transaction.amount) {
                output.results.push({success: false, error: `${transaction.from} balance is low`})
            } else if (output.balances[transaction.from] === undefined) {
                output.results.push({success: false, error: `${transaction.from} doesn't exist`})
            } else {
                output.balances[transaction.from] -= transaction.amount
                if (output.balances[transaction.to] === undefined) {
                    output.balances[transaction.to] = transaction.amount
                } else {
                    output.balances[transaction.to] += transaction.amount
                }
                output.results.push({success: true})
                output.successfulTransactions += 1
            }
        }
        output.totalTransactions += 1
    })

    return output
}