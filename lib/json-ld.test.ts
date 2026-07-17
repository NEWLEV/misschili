import { describe, it, expect } from 'vitest';
import { safeJsonLd } from './json-ld';

describe('safeJsonLd', () => {
  it('serializes plain data like JSON.stringify', () => {
    expect(safeJsonLd({ a: 1, b: 'two' })).toBe('{"a":1,"b":"two"}');
  });

  it('escapes "<" so a value cannot close the surrounding <script> tag', () => {
    const malicious = { name: '</script><script>alert(1)</script>' };
    const output = safeJsonLd(malicious);
    expect(output).not.toContain('</script>');
    expect(output).toContain('\\u003c/script>');
  });

  it('round-trips back to the original value once parsed (\\u003c is a valid JSON escape)', () => {
    const input = { name: '</script>Ghost Pepper' };
    const output = safeJsonLd(input);
    expect(JSON.parse(output)).toEqual(input);
  });
});
