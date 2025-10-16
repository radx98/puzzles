import { describe, it, expect } from 'vitest';
import { processLibraryTransactions } from './Library';

describe('Library Book Checkout System', () => {
    describe('Regular Functionality', () => {
        it('should successfully checkout an available book', () => {
            const inventory = [{ "BOOK1": { title: "The Great Book", status: "available" } }];
            const transactions = [{ type: "checkout", patronId: "PATRON1", bookId: "BOOK1" }];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory[0]["BOOK1"].status).toBe("PATRON1");
            expect(result.errors).toEqual([]);
        });

        it('should successfully return a checked out book', () => {
            const inventory = [{ "BOOK1": { title: "The Great Book", status: "PATRON1" } }];
            const transactions = [{ type: "return", patronId: "PATRON1", bookId: "BOOK1" }];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory[0]["BOOK1"].status).toBe("available");
            expect(result.errors).toEqual([]);
        });

        it('should handle multiple transactions in sequence', () => {
            const inventory = [
                { "BOOK1": { title: "The Great Book", status: "available" } },
                { "BOOK2": { title: "Another Book", status: "available" } }
            ];
            const transactions = [
                { type: "checkout", patronId: "PATRON1", bookId: "BOOK1" },
                { type: "checkout", patronId: "PATRON2", bookId: "BOOK2" },
                { type: "return", patronId: "PATRON1", bookId: "BOOK1" }
            ];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory[0]["BOOK1"].status).toBe("available");
            expect(result.inventory[1]["BOOK2"].status).toBe("PATRON2");
            expect(result.errors).toEqual([]);
        });

        it('should handle same patron checking out multiple books', () => {
            const inventory = [
                { "BOOK1": { title: "The Great Book", status: "available" } },
                { "BOOK2": { title: "Another Book", status: "available" } }
            ];
            const transactions = [
                { type: "checkout", patronId: "PATRON1", bookId: "BOOK1" },
                { type: "checkout", patronId: "PATRON1", bookId: "BOOK2" }
            ];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory[0]["BOOK1"].status).toBe("PATRON1");
            expect(result.inventory[1]["BOOK2"].status).toBe("PATRON1");
            expect(result.errors).toEqual([]);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should return error when trying to checkout non-existent book', () => {
            const inventory = [{ "BOOK1": { title: "The Great Book", status: "available" } }];
            const transactions = [{ type: "checkout", patronId: "PATRON1", bookId: "NONEXISTENT" }];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.errors).toEqual(["NONEXISTENT is not in inventory!"]);
            expect(result.inventory).toEqual(inventory); // Inventory unchanged
        });

        it('should return error when trying to checkout already checked out book', () => {
            const inventory = [{ "BOOK1": { title: "The Great Book", status: "PATRON1" } }];
            const transactions = [{ type: "checkout", patronId: "PATRON2", bookId: "BOOK1" }];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.errors).toEqual(["BOOK1 checked out!"]);
            expect(result.inventory[0]["BOOK1"].status).toBe("PATRON1"); // Status unchanged
        });

        it('should return error when trying to return non-existent book', () => {
            const inventory = [{ "BOOK1": { title: "The Great Book", status: "available" } }];
            const transactions = [{ type: "return", patronId: "PATRON1", bookId: "NONEXISTENT" }];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.errors).toEqual(["NONEXISTENT is not in inventory!"]);
            expect(result.inventory).toEqual(inventory); // Inventory unchanged
        });

        it('should return error when trying to return already available book', () => {
            const inventory = [{ "BOOK1": { title: "The Great Book", status: "available" } }];
            const transactions = [{ type: "return", patronId: "PATRON1", bookId: "BOOK1" }];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.errors).toEqual(["BOOK1 is already in inventory!"]);
            expect(result.inventory[0]["BOOK1"].status).toBe("available"); // Status unchanged
        });

        it('should handle mixed valid and invalid transactions', () => {
            const inventory = [
                { "BOOK1": { title: "The Great Book", status: "available" } },
                { "BOOK2": { title: "Another Book", status: "PATRON1" } }
            ];
            const transactions = [
                { type: "checkout", patronId: "PATRON2", bookId: "BOOK1" }, // Valid
                { type: "checkout", patronId: "PATRON3", bookId: "BOOK2" }, // Invalid - already checked out
                { type: "return", patronId: "PATRON1", bookId: "BOOK2" },   // Valid
                { type: "return", patronId: "PATRON4", bookId: "NONEXISTENT" } // Invalid - doesn't exist
            ];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory[0]["BOOK1"].status).toBe("PATRON2");
            expect(result.inventory[1]["BOOK2"].status).toBe("available");
            expect(result.errors).toEqual([
                "BOOK2 checked out!",
                "NONEXISTENT is not in inventory!"
            ]);
        });

        it('should handle empty transactions array', () => {
            const inventory = [{ "BOOK1": { title: "The Great Book", status: "available" } }];
            const transactions = [];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory).toEqual(inventory);
            expect(result.errors).toEqual([]);
        });

        it('should handle empty inventory', () => {
            const inventory = [];
            const transactions = [{ type: "checkout", patronId: "PATRON1", bookId: "BOOK1" }];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory).toEqual([]);
            expect(result.errors).toEqual(["BOOK1 is not in inventory!"]);
        });

        it('should handle books with different patron IDs in status', () => {
            const inventory = [
                { "BOOK1": { title: "Book 1", status: "PATRON1" } },
                { "BOOK2": { title: "Book 2", status: "PATRON2" } }
            ];
            const transactions = [
                { type: "return", patronId: "PATRON1", bookId: "BOOK1" },
                { type: "return", patronId: "PATRON2", bookId: "BOOK2" }
            ];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory[0]["BOOK1"].status).toBe("available");
            expect(result.inventory[1]["BOOK2"].status).toBe("available");
            expect(result.errors).toEqual([]);
        });
    });

    describe('Complex Scenarios', () => {
        it('should handle rapid checkout and return cycles', () => {
            const inventory = [{ "BOOK1": { title: "The Great Book", status: "available" } }];
            const transactions = [
                { type: "checkout", patronId: "PATRON1", bookId: "BOOK1" },
                { type: "return", patronId: "PATRON1", bookId: "BOOK1" },
                { type: "checkout", patronId: "PATRON2", bookId: "BOOK1" },
                { type: "return", patronId: "PATRON2", bookId: "BOOK1" }
            ];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory[0]["BOOK1"].status).toBe("available");
            expect(result.errors).toEqual([]);
        });

        it('should handle large inventory with multiple books', () => {
            const inventory = [
                { "BOOK1": { title: "Book 1", status: "available" } },
                { "BOOK2": { title: "Book 2", status: "PATRON1" } },
                { "BOOK3": { title: "Book 3", status: "available" } },
                { "BOOK4": { title: "Book 4", status: "PATRON2" } }
            ];
            const transactions = [
                { type: "checkout", patronId: "PATRON3", bookId: "BOOK1" },
                { type: "return", patronId: "PATRON1", bookId: "BOOK2" },
                { type: "checkout", patronId: "PATRON4", bookId: "BOOK3" },
                { type: "return", patronId: "PATRON2", bookId: "BOOK4" }
            ];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory[0]["BOOK1"].status).toBe("PATRON3");
            expect(result.inventory[1]["BOOK2"].status).toBe("available");
            expect(result.inventory[2]["BOOK3"].status).toBe("PATRON4");
            expect(result.inventory[3]["BOOK4"].status).toBe("available");
            expect(result.errors).toEqual([]);
        });

        it('should accumulate multiple errors from different transactions', () => {
            const inventory = [{ "BOOK1": { title: "The Great Book", status: "available" } }];
            const transactions = [
                { type: "checkout", patronId: "PATRON1", bookId: "BOOK1" },
                { type: "checkout", patronId: "PATRON2", bookId: "BOOK1" }, // Error: already checked out
                { type: "return", patronId: "PATRON1", bookId: "BOOK1" },
                { type: "return", patronId: "PATRON3", bookId: "BOOK1" }, // Error: already available
                { type: "checkout", patronId: "PATRON4", bookId: "FAKEBOOK" } // Error: doesn't exist
            ];

            const result = processLibraryTransactions(inventory, transactions);

            expect(result.inventory[0]["BOOK1"].status).toBe("available");
            expect(result.errors).toEqual([
                "BOOK1 checked out!",
                "BOOK1 is already in inventory!",
                "FAKEBOOK is not in inventory!"
            ]);
        });
    });
});
