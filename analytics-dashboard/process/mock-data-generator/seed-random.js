/**
 * Seeded Random Number Generator
 * Same seed always produces same sequence
 *
 * Usage:
 *   const rng = createSeededRandom('my-seed-string');
 *   rng.next();           // 0-1 like Math.random()
 *   rng.intBetween(1,10); // integer 1-10
 *   rng.varyBy(100, 25);  // 100 ± 25%
 */

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function createSeededRandom(seed) {
  let state = hashCode(String(seed));

  return {
    // Returns 0-1 (like Math.random())
    next() {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    },

    // Returns integer between min and max (inclusive)
    intBetween(min, max) {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },

    // Returns value within ±variance% of base
    varyBy(base, variancePercent) {
      const variance = base * (variancePercent / 100);
      const offset = (this.next() - 0.5) * 2 * variance;
      return Math.round(base + offset);
    },

    // Pick random item from array
    pick(array) {
      return array[this.intBetween(0, array.length - 1)];
    },

    // Shuffle array (returns new array)
    shuffle(array) {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = this.intBetween(0, i);
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    }
  };
}

module.exports = { hashCode, createSeededRandom };
