import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import { legalLayers, graphArcs, ctcPage } from '../inputs/ctc-pages.mjs';

const data=JSON.parse(readFileSync(new URL('../inputs/ctc-pages.json',import.meta.url),'utf8'));
test('笔迹页与词图修订的格式与关联', () => {
  assert.equal(data.frames % data.pageFrames, 0);
  assert.ok(data.shortGraph[0][3] === data.shortGraph[1][3]);
  assert.notDeepEqual(data.shortGraph[0][4], data.shortGraph[1][4]);
  const before = ctcPage(118), after = ctcPage(118,2);
  assert.equal(before.length, data.pageFrames);
  assert.ok(before.every(f => f.length === data.alphabet.length));
  assert.notDeepEqual(before,after);
  assert.equal(new Set(graphArcs('original',71).map(a=>a[0])).size,graphArcs('original',71).length);
  assert.ok(graphArcs('contracted',60).length < graphArcs('original',60).length);
  assert.ok(data.maxChangedPageReads < data.frames / data.pageFrames);
  assert.ok(data.maxResidentBytes < data.frames*data.layers*8);
  assert.ok(ctcPage(1).every(p=>Math.abs(p.reduce((s,x)=>s+Math.exp(x),0)-1)<1e-12));
  assert.equal(data.confirmation.length,60);
  assert.ok(data.confirmation.every((id,l)=>graphArcs('original',l).some(a=>a[0]===id)));
  assert.ok(!graphArcs('contracted',59).some(a=>a[0]===data.confirmation.at(-1)));
  assert.ok(legalLayers(118)[1]-legalLayers(118)[0]<=12);
});
