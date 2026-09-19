// Plattar ut en övnings block och repetitioner till en linjär lista av moment.
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
  return moments;
}
