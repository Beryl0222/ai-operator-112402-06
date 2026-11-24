import {readFileSync} from 'node:fs';
const data = JSON.parse(readFileSync(new URL('./ctc-pages.json', import.meta.url), 'utf8'));
function expectedLayer(frame) {
  return Math.min(data.layers - 1, Math.floor(frame * data.layers / data.frames));
}
export function legalLayers(page) {
  const start = page * data.pageFrames, stop = start + data.pageFrames;
  return [Math.max(0, expectedLayer(start) - 4), Math.min(data.layers, expectedLayer(stop) + 5)];
}
export function graphArcs(revision, layer) {
  if (!data.graphRevisions.includes(revision)) throw new RangeError('无此词图');
  if (layer < 0 || layer >= data.layers) return [];
  const arcs = [];
  for (let from = 0; from < (layer === 0 ? 1 : data.width); from++) {
    for (let to = 0; to < (layer === data.layers - 1 ? 1 : data.width); to++) {
      if (revision === 'contracted' && layer === 60 && from > 0) continue;
      if (revision === 'contracted' && layer === 59 && to > 0) continue;
      const primary = 1 + ((Math.floor(layer / 2)) % (data.alphabet.length - 1));
      const label = (from === 2 || revision === 'alternate' && layer > 150 && to === 0) ? 1 + primary % (data.alphabet.length - 1) : primary;
      arcs.push([`${layer}.${from}.${to}`,[layer,from],[layer+1,to],label,[layer*3+to,layer*3+to+4],-(to+from+1)/8]);
    }
  }
  return arcs;
}
export function ctcPage(page, physicalCopy = 1) {
  if (!Number.isInteger(page) || page < 0 || page >= data.frames / data.pageFrames) throw new RangeError('笔迹页越界');
  return Array.from({length:data.pageFrames}, (_, within) => {
    const frame = page*data.pageFrames+within;
    const layer = expectedLayer(frame);
    const label = 1 + (Math.floor(layer / 2) % (data.alphabet.length - 1));
    const probabilities = Array(data.alphabet.length).fill(0.015625);
    probabilities[0] = 0.25;
    probabilities[label] = 0.65625;
    if (physicalCopy > 1 && within >= 16 && within < 40) {
      probabilities[0] = 0.65625;
      probabilities[label] = 0.25;
    }
    return probabilities.map(Math.log);
  });
}
