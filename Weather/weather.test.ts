import { describe, it, expect } from 'vitest'
import { processWeatherReadings } from './weather'

describe('processWeatherReadings', () => {
    it('should process basic temperature readings correctly', () => {
        const readings = [
            { timestamp: "08:00", temperature: 15 },
            { timestamp: "12:00", temperature: 22 },
            { timestamp: "18:00", temperature: 18 }
        ]

        const result = processWeatherReadings(readings)

        expect(result.totalReadings).toBe(3)
        expect(result.averageTemp).toBeCloseTo(18.33, 2)
        expect(result.highestTemp).toBe(22)
        expect(result.lowestTemp).toBe(15)
        expect(result.readings).toHaveLength(3)
    })

    it('should handle single reading', () => {
        const readings = [
            { timestamp: "12:00", temperature: 20 }
        ]

        const result = processWeatherReadings(readings)

        expect(result.totalReadings).toBe(1)
        expect(result.averageTemp).toBe(20)
        expect(result.highestTemp).toBe(20)
        expect(result.lowestTemp).toBe(20)
        expect(result.readings).toHaveLength(1)
    })

    it('should handle negative temperatures', () => {
        const readings = [
            { timestamp: "06:00", temperature: -5 },
            { timestamp: "12:00", temperature: 10 },
            { timestamp: "18:00", temperature: 0 }
        ]

        const result = processWeatherReadings(readings)

        expect(result.totalReadings).toBe(3)
        expect(result.averageTemp).toBeCloseTo(1.67, 2)
        expect(result.highestTemp).toBe(10)
        expect(result.lowestTemp).toBe(-5)
    })

    it('should handle duplicate temperatures', () => {
        const readings = [
            { timestamp: "08:00", temperature: 15 },
            { timestamp: "12:00", temperature: 15 },
            { timestamp: "16:00", temperature: 15 }
        ]

        const result = processWeatherReadings(readings)

        expect(result.totalReadings).toBe(3)
        expect(result.averageTemp).toBe(15)
        expect(result.highestTemp).toBe(15)
        expect(result.lowestTemp).toBe(15)
    })

    it('should handle large temperature variations', () => {
        const readings = [
            { timestamp: "02:00", temperature: -20 },
            { timestamp: "14:00", temperature: 40 },
            { timestamp: "22:00", temperature: 5 }
        ]

        const result = processWeatherReadings(readings)

        expect(result.totalReadings).toBe(3)
        expect(result.averageTemp).toBeCloseTo(8.33, 2)
        expect(result.highestTemp).toBe(40)
        expect(result.lowestTemp).toBe(-20)
    })

    it('should sort readings by timestamp', () => {
        const readings = [
            { timestamp: "18:00", temperature: 18 },
            { timestamp: "08:00", temperature: 15 },
            { timestamp: "12:00", temperature: 22 }
        ]

        const result = processWeatherReadings(readings)

        // Check that readings are sorted (though the current implementation might have bugs)
        expect(result.readings).toHaveLength(3)
        expect(result.totalReadings).toBe(3)
    })

    it('should sort timestamps in chronological order (ascending)', () => {
        const readings = [
            { timestamp: "18:00", temperature: 18 },
            { timestamp: "08:00", temperature: 8 },
            { timestamp: "12:00", temperature: 12 }
        ]

        const result = processWeatherReadings(readings)

        // SHOULD be in chronological order (earliest first)
        // This test will FAIL because the implementation sorts in descending order
        expect(result.readings[0].timestamp).toBe("08:00")
        expect(result.readings[1].timestamp).toBe("12:00")
        expect(result.readings[2].timestamp).toBe("18:00")
    })

    it('should handle empty array gracefully', () => {
        const readings: Array<{ timestamp: string, temperature: number }> = []

        const result = processWeatherReadings(readings)

        expect(result.totalReadings).toBe(0)
        expect(result.readings).toHaveLength(0)
        // These should NOT be NaN or Infinity - they should be 0 or handled properly
        expect(result.averageTemp).toBe(0) // Should be 0, not NaN
        expect(result.highestTemp).toBe(0) // Should be 0, not -Infinity  
        expect(result.lowestTemp).toBe(0) // Should be 0, not Infinity
    })

    it('should handle decimal temperatures', () => {
        const readings = [
            { timestamp: "08:00", temperature: 15.5 },
            { timestamp: "12:00", temperature: 22.7 },
            { timestamp: "18:00", temperature: 18.3 }
        ]

        const result = processWeatherReadings(readings)

        expect(result.totalReadings).toBe(3)
        expect(result.averageTemp).toBeCloseTo(18.83, 2)
        expect(result.highestTemp).toBe(22.7)
        expect(result.lowestTemp).toBe(15.5)
    })

    it('should handle many readings', () => {
        const readings = [
            { timestamp: "00:00", temperature: 10 },
            { timestamp: "01:00", temperature: 11 },
            { timestamp: "02:00", temperature: 12 },
            { timestamp: "03:00", temperature: 13 },
            { timestamp: "04:00", temperature: 14 },
            { timestamp: "05:00", temperature: 15 },
        ]

        const result = processWeatherReadings(readings)

        expect(result.totalReadings).toBe(6)
        expect(result.averageTemp).toBe(12.5)
        expect(result.highestTemp).toBe(15)
        expect(result.lowestTemp).toBe(10)
    })

    it('should preserve original readings in output', () => {
        const readings = [
            { timestamp: "08:00", temperature: 15 },
            { timestamp: "12:00", temperature: 22 }
        ]

        const result = processWeatherReadings(readings)

        expect(result.readings).toEqual(expect.arrayContaining([
            { timestamp: "08:00", temperature: 15 },
            { timestamp: "12:00", temperature: 22 }
        ]))
    })

})
