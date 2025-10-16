/**
 * Parking Garage — Event Log Billing
 *
 * Implement a billing system for a single-level parking garage that processes a stream of events.
 * The garage has limited capacity. Cars enter and exit at specific minute timestamps (same day).
 *
 * Rules:
 * - "enter":
 *    * Deny if the garage is full or the plate is already inside (record an error; ignore the enter).
 *    * Otherwise mark the plate as inside with its entry time.
 * - "exit":
 *    * Deny if the plate is not currently inside or if exit time < entry time (record an error; ignore the exit).
 *    * Otherwise compute the parking fee and create a receipt, then remove the car from inside.
 * - Fee:
 *    * If total minutes parked <= graceMinutes → fee = 0.
 *    * Otherwise fee = perHour * ceil((minutesParked - graceMinutes) / 60).
 * - Events are processed in the given order. All numbers are integers. Deterministic; no time zones.
 *
 * Input format:
 * {
 *   capacity: number,                          // max simultaneous cars
 *   rates: { perHour: number, graceMinutes: number }, // cents and minutes
 *   events: Array<["enter", string, number] | ["exit", string, number]>
 * }
 *
 * Output format:
 * {
 *   receipts: Array<{ plate: string, minutes: number, fee: number, exitedAt: number }>,
 *   revenue: number,                           // total of all fees in cents
 *   inside: { [plate: string]: { since: number } }, // cars still inside after all events
 *   errors: string[]                           // textual descriptions in event order
 * }
 *
 * Example:
 * Input:
 * {
 *   capacity: 2,
 *   rates: { perHour: 300, graceMinutes: 15 },
 *   events: [
 *     ["enter", "ABC123", 0],
 *     ["enter", "XYZ999", 5],
 *     ["enter", "OVERFL", 10],     // error: full
 *     ["exit",  "ABC123", 20],     // 20min → within grace → fee 0
 *     ["exit",  "XYZ999", 100],    // 95min → bill ceil((95-15)/60)=2 → 600
 *     ["exit",  "GHOST", 50]       // error: not inside
 *   ]
 * }
 *
 * Output:
 * {
 *   receipts: [
 *     { plate: "ABC123", minutes: 20, fee: 0, exitedAt: 20 },
 *     { plate: "XYZ999", minutes: 95, fee: 600, exitedAt: 100 }
 *   ],
 *   revenue: 600,
 *   inside: {},
 *   errors: [
 *     "enter denied: capacity full for OVERFL at 10",
 *     "exit denied: GHOST not inside at 50"
 *   ]
 * }
 */

export function processParking(input) {
    // TODO
  }