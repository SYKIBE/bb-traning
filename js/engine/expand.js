import { getMomentType } from '../data/momentTypes.js';

// Plattar ut en övnings block och repetitioner till en linjär lista av moment.
// En övning ska alltid avslutas med ett knip, så vila i slutet tas bort.
// Ren funktion, inget DOM – lätt att testa.
export function expand(exercise) {
  const moments = [];
  exercise.blocks.forEach((block, blockIndex) => {
    const repeat = block.repeat ?? 1;
    for (let iteration = 0; iteration < repeat; iteration++) {
      for (const moment of block.moments) {
        moments.push({ ...moment, index: moments.length, blockIndex, iteration, repeat });
      }
    }
  });
  while (moments.length > 0 && getMomentType(moments.at(-1).type).rest) moments.pop();
  return moments;
}
