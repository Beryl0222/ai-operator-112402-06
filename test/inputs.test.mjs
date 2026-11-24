import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const d = JSON.parse(readFileSync(new URL('../inputs/session.json', import.meta.url), 'utf8'));

test("打分覆盖字符表", () => {
  assert.ok(d.blocks.every(b=>b.scores.every(s=>s.length===d.alphabet.length)));
});

test("替换恰好邻接确认边界", () => {
  assert.ok(d.blocks[1].from===d.blocks[2].from && d.events[2][2]+1===d.blocks[2].from);
});

test("重复字和不可行帧可表达", () => {
  assert.ok(d.candidates.some(c=>c[0]===c[1]) && d.blocks.some(b=>b.scores.some(s=>s.includes(null))));
});

test("各帧提供归一化对数概率", () => {
  assert.ok(d.blocks.every(b=>b.scores.every(s=>Math.abs(s.reduce((a,x)=>a+(x===null?0:Math.exp(x)),0)-1)<1e-9)));
});
