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

type Event = ['enter' | 'exit', string, number]
type Rate = { perHour: number, graceMinutes: number }
type Input = {
  capacity: number,
  rates: Rate,
  events: Event[],
}
type Receipt = {
  plate: string,
  minutes: number,
  fee: number,
  exitedAt: number
}
type Inside = { string: { since: number } } | {}
type Output = {
  receipts: Receipt[],
  revenue: number,
  inside: Inside,
  errors: string[]
}

function handleEnter(carsInside: Inside[], capacity: number, rate: Rate, event: Event): 'full' | 'already inside' | Inside[] {
  const [, plate, since] = event
  console.log('PLATE', plate)

  if (carsInside.length === capacity) return 'full'
  for (let i = 0; i < carsInside.length; i++) {
    if (carsInside[i][plate]) return 'already inside'
  }

  carsInside.push({ [plate]: { since: since } })
  return carsInside
}

function handleExit(carsInside: Inside[], capacity: number, rate: Rate, event: Event): 'not inside' | 'before entry' | Receipt {
  const [, plate, since] = event
  const platesInside = carsInside.map(car => Object.keys(car)[0])

  console.log('exiting EVENT', event, 'CARSINSIDE', carsInside, 'PLATESINSIDE', platesInside)

  if (!platesInside.includes(plate)) {
    return 'not inside'
  }

  const exitingCar = carsInside[platesInside.indexOf(plate)]
  console.log('EXITING CAR', exitingCar)
  if (since < exitingCar[plate].since) {
    return 'before entry'
  }

  const totalMinutesParked = event[2] - exitingCar[plate].since
  let fee = 0
  if (totalMinutesParked > rate.graceMinutes) {
    fee = rate.perHour * Math.ceil((totalMinutesParked - rate.graceMinutes) / 60)
  }
  console.log('FEE', fee, 'TMP', totalMinutesParked, 'HRS', Math.ceil((totalMinutesParked - rate.graceMinutes) / 60), 'GRACE', rate.graceMinutes)

  let receipt: Receipt = {
    plate: plate,
    minutes: totalMinutesParked,
    fee: fee,
    exitedAt: event[2]
  }

  carsInside.splice(platesInside.indexOf(plate), 1)

  console.log('CARSINSIDEAFTERDELETION', carsInside)
  console.log('CTOREM', platesInside.indexOf(plate))
  console.log('RMVC-1', carsInside.slice(0, platesInside.indexOf(plate)), 'RMVC-2', carsInside.slice(platesInside.indexOf(plate) + 1, carsInside.length - 1))

  return receipt
}

export function processParking(input: Input): Output {
  const { capacity, rates, events } = input
  let output: Output = {
    receipts: [],
    revenue: 0,
    inside: {},
    errors: []
  }
  let carsInside = []

  for (let i = 0; i < events.length; i++) {

    if (events[i][0] === 'enter') {

      const enterResult = handleEnter(carsInside, capacity, rates, events[i])
      console.log('ENR', enterResult)
      if (typeof (enterResult) === 'string') {
        output.errors.push(enterResult)
      }

    } else if (events[i][0] === 'exit') {

      const exitResult = handleExit(carsInside, capacity, rates, events[i])
      console.log('EXR', exitResult)
      if (typeof (exitResult) === 'string') {
        output.errors.push(exitResult)
      } else {
        output.receipts.push(exitResult)
        output.revenue += exitResult.fee
      }

    }

    console.log('OUTREV', output.revenue)

  }

  console.log('CARSINSIDEFINAL', carsInside)
  output.inside = carsInside.length != 0 ? carsInside[0] : {}

  return output
}