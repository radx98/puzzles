// code.test.ts
import { describe, it, expect } from 'vitest';
import { processParking } from './parking';

describe('processParking', () => {
  it('matches the example scenario (capacity full, grace free exit, paid exit, ghost exit)', () => {
    const input = {
      capacity: 2,
      rates: { perHour: 300, graceMinutes: 15 },
      events: [
        ['enter', 'ABC123', 0],
        ['enter', 'XYZ999', 5],
        ['enter', 'OVERFL', 10],   // full -> error
        ['exit', 'ABC123', 20],    // 20min -> within grace -> fee 0
        ['exit', 'XYZ999', 100],   // 95min -> ceil((95-15)/60)=2 -> 600
        ['exit', 'GHOST', 50],     // not inside -> error
      ] as const,
    };

    const out = processParking(input);

    expect(out.revenue).toBe(600);
    expect(out.inside).toEqual({});
    expect(out.receipts).toEqual([
      { plate: 'ABC123', minutes: 20, fee: 0, exitedAt: 20 },
      { plate: 'XYZ999', minutes: 95, fee: 600, exitedAt: 100 },
    ]);
    expect(out.errors.length).toBe(2);
    expect(out.errors[0]).toMatch(/enter denied|full|OVERFL/i);
    expect(out.errors[1]).toMatch(/exit denied|not inside|GHOST/i);
  });

  it('denies duplicate enter for same plate; later exit bills once', () => {
    const input = {
      capacity: 2,
      rates: { perHour: 300, graceMinutes: 15 },
      events: [
        ['enter', 'DUP111', 0],
        ['enter', 'DUP111', 1],   // already inside -> error
        ['exit', 'DUP111', 10],   // 10min -> within grace -> 0
      ] as const,
    };

    const out = processParking(input);

    expect(out.receipts).toEqual([
      { plate: 'DUP111', minutes: 10, fee: 0, exitedAt: 10 },
    ]);
    expect(out.revenue).toBe(0);
    expect(out.inside).toEqual({});
    expect(out.errors.length).toBe(1);
    expect(out.errors[0]).toMatch(/already inside|enter denied|DUP111/i);
  });

  it('capacity frees after an exit; subsequent enter is allowed and billed correctly', () => {
    const input = {
      capacity: 1,
      rates: { perHour: 300, graceMinutes: 15 },
      events: [
        ['enter', 'A1', 0],
        ['enter', 'B2', 1],      // full -> error
        ['exit', 'A1', 2],       // within grace -> 0
        ['enter', 'B2', 3],      // now allowed
        ['exit', 'B2', 64],      // 61min -> ceil((61-15)/60)=1 -> 300
      ] as const,
    };

    const out = processParking(input);

    expect(out.receipts).toEqual([
      { plate: 'A1', minutes: 2, fee: 0, exitedAt: 2 },
      { plate: 'B2', minutes: 61, fee: 300, exitedAt: 64 },
    ]);
    expect(out.revenue).toBe(300);
    expect(out.inside).toEqual({});
    expect(out.errors.length).toBe(1);
    expect(out.errors[0]).toMatch(/full|enter denied|B2/i);
  });

  it('rejects exit earlier than entry; later valid exit bills from original entry', () => {
    const input = {
      capacity: 3,
      rates: { perHour: 250, graceMinutes: 15 },
      events: [
        ['enter', 'C3', 50],
        ['exit', 'C3', 49],     // exit before entry -> error
        ['exit', 'C3', 110],    // 60min -> ceil((60-15)/60)=1 -> 250
      ] as const,
    };

    const out = processParking(input);

    expect(out.receipts).toEqual([
      { plate: 'C3', minutes: 60, fee: 250, exitedAt: 110 },
    ]);
    expect(out.revenue).toBe(250);
    expect(out.inside).toEqual({});
    expect(out.errors.length).toBe(1);
    expect(out.errors[0]).toMatch(/exit denied|before entry|C3/i);
  });

  it('grace boundary: exactly at grace is free; just over grace bills one hour', () => {
    const rates = { perHour: 400, graceMinutes: 15 };
    const input = {
      capacity: 5,
      rates,
      events: [
        ['enter', 'FREE0', 0],
        ['exit', 'FREE0', 15],    // exactly grace -> 0
        ['enter', 'ONEHR', 0],
        ['exit', 'ONEHR', 16],    // 16 -> ceil((16-15)/60)=1 -> 400
      ] as const,
    };

    const out = processParking(input);

    expect(out.receipts).toEqual([
      { plate: 'FREE0', minutes: 15, fee: 0, exitedAt: 15 },
      { plate: 'ONEHR', minutes: 16, fee: 400, exitedAt: 16 },
    ]);
    expect(out.revenue).toBe(400);
    expect(out.inside).toEqual({});
  });

  it('multi-hour rounding uses ceiling after grace', () => {
    const input = {
      capacity: 10,
      rates: { perHour: 300, graceMinutes: 15 },
      events: [
        ['enter', 'LONG1', 0],
        ['exit', 'LONG1', 190],  // 190 -> ceil((190-15)/60)=ceil(175/60)=3 -> 900
      ] as const,
    };

    const out = processParking(input);

    expect(out.receipts).toEqual([
      { plate: 'LONG1', minutes: 190, fee: 900, exitedAt: 190 },
    ]);
    expect(out.revenue).toBe(900);
    expect(out.inside).toEqual({});
  });

  it('keeps cars that never exited in the "inside" map with original entry time', () => {
    const input = {
      capacity: 2,
      rates: { perHour: 300, graceMinutes: 15 },
      events: [
        ['enter', 'STAY1', 7],
        ['enter', 'LEAVE', 10],
        ['exit', 'LEAVE', 30],   // within grace -> 0
      ] as const,
    };

    const out = processParking(input);

    expect(out.receipts).toEqual([
      { plate: 'LEAVE', minutes: 20, fee: 0, exitedAt: 30 },
    ]);
    expect(out.revenue).toBe(0);
    expect(out.inside).toEqual({ STAY1: { since: 7 } });
    expect(out.errors).toEqual([]);
  });
});
