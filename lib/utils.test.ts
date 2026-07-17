import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  slugify,
  calculateSavingsPercent,
  isActiveSale,
  generateOrderNumber,
  truncate,
  getInitials,
} from './utils';

describe('formatPrice', () => {
  it('formats a number as USD currency', () => {
    expect(formatPrice(12.5)).toBe('$12.50');
  });

  it('formats a numeric string', () => {
    expect(formatPrice('9.99')).toBe('$9.99');
  });

  it('rounds to two decimal places', () => {
    expect(formatPrice(3.005)).toBe('$3.01');
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Fiery Heat Ghost Pepper')).toBe('fiery-heat-ghost-pepper');
  });

  it('strips punctuation', () => {
    expect(slugify("Miss Chili's Hot Sauce!")).toBe('miss-chilis-hot-sauce');
  });

  it('collapses repeated whitespace/underscores', () => {
    expect(slugify('too   many_ _spaces')).toBe('too-many-spaces');
  });
});

describe('calculateSavingsPercent', () => {
  it('computes percent off', () => {
    expect(calculateSavingsPercent(10, 8)).toBe(20);
  });

  it('returns 0 when sale price is not actually lower', () => {
    expect(calculateSavingsPercent(10, 10)).toBe(0);
    expect(calculateSavingsPercent(10, 12)).toBe(0);
  });

  it('returns 0 for a non-positive base price', () => {
    expect(calculateSavingsPercent(0, -1)).toBe(0);
  });
});

describe('isActiveSale', () => {
  it('is false with no sale price', () => {
    expect(isActiveSale(null, null, null)).toBe(false);
  });

  it('is true with a sale price and no date bounds', () => {
    expect(isActiveSale(8, null, null)).toBe(true);
  });

  it('is false before the sale start date', () => {
    const future = new Date(Date.now() + 86_400_000);
    expect(isActiveSale(8, future, null)).toBe(false);
  });

  it('is false after the sale end date', () => {
    const past = new Date(Date.now() - 86_400_000);
    expect(isActiveSale(8, null, past)).toBe(false);
  });

  it('is true within the sale window', () => {
    const start = new Date(Date.now() - 86_400_000);
    const end = new Date(Date.now() + 86_400_000);
    expect(isActiveSale(8, start, end)).toBe(true);
  });
});

describe('generateOrderNumber', () => {
  it('matches the MC-<timestamp>-<random> format', () => {
    expect(generateOrderNumber()).toMatch(/^MC-[0-9A-Z]+-[0-9A-Z]{4}$/);
  });

  it('generates unique values across calls', () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).not.toBe(b);
  });
});

describe('truncate', () => {
  it('leaves short strings untouched', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('truncates and appends an ellipsis', () => {
    expect(truncate('a long string here', 5)).toBe('a lon…');
  });
});

describe('getInitials', () => {
  it('takes the first letter of up to two words', () => {
    expect(getInitials('Miss Chili')).toBe('MC');
  });

  it('uppercases a single name', () => {
    expect(getInitials('chili')).toBe('C');
  });
});
