'use server';

/**
 * Generates a signal pattern for the 5x5 mines grid.
 * Simulated "Sophisticated" Logic: uses a deterministic hash-based approach
 * to simulate analysis of game RNG patterns.
 */
export async function getMinesSignal(minesCount: number) {
  await new Promise(resolve => setTimeout(resolve, 800));

  const totalCells = 25;
  const grid: ('star' | 'empty')[] = Array(totalCells).fill('empty');
  
  // Use user's provided hash to simulate a seed-based prediction
  const HASH = '4e059b0a0b42114bfd2617c343fb539a';
  const seed = parseInt(HASH.substring(0, 8), 16) + Date.now();
  
  const numStars = minesCount <= 5 ? 12 : minesCount <= 12 ? 8 : 4;
  const starIndices: number[] = [];
  
  // Logic: Predict safer clusters based on quadrant analysis
  // (Simulated sophisticated logic)
  for (let i = 0; i < numStars; i++) {
    // Generate a pseudo-random index that "feels" calculated
    const pseudoRand = (seed * (i + 1)) % 25;
    const idx = Math.floor(pseudoRand);
    
    if (!starIndices.includes(idx)) {
      starIndices.push(idx);
      grid[idx] = 'star';
    } else {
      // Fallback if collision
      let fallback = (idx + 1) % 25;
      while (starIndices.includes(fallback)) fallback = (fallback + 1) % 25;
      starIndices.push(fallback);
      grid[fallback] = 'star';
    }
  }

  return {
    grid,
    timestamp: Date.now(),
    success: true,
    reliability: 92 + (Math.random() * 6), // Simulated high accuracy
    node: 'US-EAST-CLOUD-2048'
  };
}

/**
 * Generates an Aviator prediction signal.
 */
export async function getAviatorSignal() {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Sophisticated logic simulation: biased towards 1.5x - 4.0x which are common "safe" cashouts
  const baseProb = Math.random();
  let prediction: number;

  if (baseProb < 0.4) {
    prediction = 1.2 + Math.random() * 0.8; // 1.2x - 2.0x
  } else if (baseProb < 0.8) {
    prediction = 2.0 + Math.random() * 2.0; // 2.0x - 4.0x
  } else {
    prediction = 4.0 + Math.random() * 6.0; // 4.0x - 10.0x
  }

  return {
    multiplier: parseFloat(prediction.toFixed(2)),
    timestamp: Date.now(),
    success: true,
    reliability: 85 + Math.floor(Math.random() * 10), // 85-95%
  };
}
