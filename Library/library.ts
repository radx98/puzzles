/**
 * Simple Library Book Checkout System
 *
 * You are implementing a basic library book checkout system. The library has a collection of books
 * and patrons who can check out and return books. Track which books are checked out and by whom.
 *
 * Rules:
 * - Each book has a unique ID and can only be checked out by one patron at a time
 * - Books can be checked out or returned
 * - Books must be returned by the same patron who checked them out
 * - Books have a status that can be either 'available' or the patron ID who has it checked out
 * - Invalid transactions (checking out unavailable books, returning available books, etc.) generate error messages
 *
 * Input: Library inventory and list of transactions
 * Inventory: Array of objects where each object has a bookId as key with { title: string, status: 'available' | Patron }
 * Transaction: { type: "checkout" | "return", patronId: string, bookId: string }
 *
 * Return: Object with updated inventory and array of error messages
 * { inventory: Inventory, errors: string[] }
 *
 * Example:
 * Inventory: [{ "BOOK1": { title: "The Great Book", status: "available" } }]
 * Transaction: { type: "checkout", patronId: "PATRON1", bookId: "BOOK1" }
 * Returns: { inventory: [{ "BOOK1": { title: "The Great Book", status: "PATRON1" } }], errors: [] }
 */

type Book = {
    [bookId: string]: {
        title: string,
        status: 'available' | Patron
    }
}
type Inventory = Book[]
type Patron = string
type Transaction = {
    type: "checkout" | "return",
    patronId: Patron,
    bookId: string
}
type Transactions = Transaction[]

function handleCheckout(inventory: Inventory, transaction: Transaction) {
    const inventoryBookIds = inventory.map(book => {
        const [bookUnpacked] = Object.keys(book)
        return bookUnpacked
    })
    const patronId = transaction.patronId
    const bookId = transaction.bookId
    const currentBookIndex = inventoryBookIds.indexOf(bookId)

    if (!inventoryBookIds.includes(bookId)) {
        return `${bookId} is not in inventory!`
    } else if (inventory[currentBookIndex][bookId].status != 'available') {
        return `${bookId} checked out!`
    }

    inventory[currentBookIndex][bookId].status = patronId
}

function handleReturn(inventory: Inventory, transaction: Transaction) {
    const inventoryBookIds = inventory.map(book => {
        const [bookUnpacked] = Object.keys(book)
        return bookUnpacked
    })
    const patronId = transaction.patronId
    const bookId = transaction.bookId
    const currentBookIndex = inventoryBookIds.indexOf(bookId)

    if (!inventoryBookIds.includes(bookId)) {
        return `${bookId} is not in inventory!`
    } else if (inventory[currentBookIndex][bookId].status === 'available') {
        return `${bookId} is already in inventory!`
    }

    inventory[currentBookIndex][bookId].status = 'available'

}

export function processLibraryTransactions(inventory: Inventory, transactions: Transactions) {

    let result = {
        inventory: inventory,
        errors: [] as string[]
    }

    transactions.map(transaction => {

        if (transaction.type === 'checkout') {

            const checkoutBook = handleCheckout(inventory, transaction)
            typeof(checkoutBook) === 'string' ? result.errors.push(checkoutBook) : undefined

        } else if (transaction.type === 'return') {

            const returnBook = handleReturn(inventory, transaction)
            typeof(returnBook) === 'string' ? result.errors.push(returnBook) : undefined

        }

    })

    return result
}