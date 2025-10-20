/**
 * Weather Station Logger
 *
 * You are implementing a simple weather station that logs temperature readings
 * throughout the day. The system tracks daily temperature data and provides
 * basic statistics about the recorded temperatures.
 *
 * Rules:
 * - Temperature readings are recorded with timestamps
 * - Each reading has a temperature value (in Celsius)
 * - Readings are processed in chronological order
 * - System tracks daily statistics
 *
 * Input: Array of temperature readings
 * Readings: { timestamp: string, temperature: number }
 * - timestamp: "HH:MM" format (24-hour time)
 * - temperature: temperature in Celsius (can be negative)
 *
 * Output: Object with temperature data and statistics
 * {
 *   readings: Array<{ timestamp: string, temperature: number }>,  // all readings
 *   averageTemp: number,  // average temperature for the day
 *   highestTemp: number,  // highest temperature recorded
 *   lowestTemp: number,   // lowest temperature recorded
 *   totalReadings: number
 * }
 *
 * Example:
 * Readings: [
 *   { timestamp: "08:00", temperature: 15 },
 *   { timestamp: "12:00", temperature: 22 },
 *   { timestamp: "18:00", temperature: 18 }
 * ]
 * Result: average 18.33, highest 22, lowest 15, 3 total readings
 */

type Output = {
    readings: Array<{ timestamp: string, temperature: number }>
    averageTemp: number,
    highestTemp: number, 
    lowestTemp: number,
    totalReadings: number
}

export function processWeatherReadings(readings: Array<{ timestamp: string, temperature: number }>): Output {
    
    let output: Output = {
        readings: [],
        averageTemp: 0,
        highestTemp: 0, 
        lowestTemp: 0,
        totalReadings: 0
    }

    if (readings.length != 0) {

        readings.sort((a, b) =>
            Number(a.timestamp.split(':')[1]) -
            Number(b.timestamp.split(':')[1])
            ).sort((a, b) =>
            Number(a.timestamp.split(':')[0]) -
            Number(b.timestamp.split(':')[0])
        )

        output.readings = readings

        output.averageTemp = readings.map(reading => reading.temperature).reduce((a, b) => a + b, 0) / readings.length
        output.highestTemp = Math.max(...readings.map(reading => reading.temperature))
        output.lowestTemp = Math.min(...readings.map(reading => reading.temperature))
        output.totalReadings = readings.length

    }

    return output

}
