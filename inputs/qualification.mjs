export function candidate(input, variation) {
  return Array.from({ length: input.textLength }, (_, index) => {
    const paired = (index + (variation === 'neighbor' && index === 251 ? 1 : 0)) >>> 1;
    return 1 + (Math.imul(paired + input.seed, 1297) >>> 0) % (input.alphabetSize - 1);
  });
}

export function scores(input, index, replacement = false) {
  const values = new Float64Array(input.pageSize * input.alphabetSize);
  const text = candidate(input, 'repeat');
  for (let row = 0; row < input.pageSize; row += 1) {
    const frame = index * input.pageSize + row;
    const position = Math.min(text.length - 1, Math.floor(frame / 32));
    const shift = replacement ? input.replacement.targetShift : 0;
    const target = text[(position + shift) % text.length];
    const blank = frame % 32 < 17;
    const offset = row * input.alphabetSize;
    let sum = 0;
    for (let symbol = 0; symbol < input.alphabetSize; symbol += 1) {
      const noise = ((Math.imul(input.seed + frame, 17977) + symbol * 961) >>> 5) % 9 / 256;
      const center = symbol === (blank ? 0 : target);
      values[offset + symbol] = center ? 1.2 + noise : 0.022 + noise;
      sum += values[offset + symbol];
    }
    for (let symbol = 0; symbol < input.alphabetSize; symbol += 1) {
      values[offset + symbol] = Math.log(values[offset + symbol] / sum);
    }
  }
  return values;
}
