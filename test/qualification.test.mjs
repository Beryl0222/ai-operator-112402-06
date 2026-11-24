import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const qualification = JSON.parse(readFileSync(new URL('../inputs/qualification.json', import.meta.url), 'utf8'));

const { candidate, scores } = await import('../inputs/qualification.mjs');
test('长笔迹供给可逐页读取，重复字符的两个候选共享绝大多数位置', () => {
  const a = candidate(qualification, 'repeat');
  const b = candidate(qualification, 'neighbor');
  assert.equal(a.length, 256);
  assert.ok(a.some((x, i) => x === a[i + 1]));
  assert.equal(a.filter((x, i) => x !== b[i]).length, 1);
  const input = scores(qualification, qualification.replacement.page);
  const changed = scores(qualification, qualification.replacement.page, true);
  assert.notDeepEqual(input, changed);
  const mass = input.slice(0, qualification.alphabetSize).reduce((acc, x) => acc + Math.exp(x), 0);
  assert.ok(Math.abs(mass - 1) < 1e-12);
});
test('替换页与后验请求相交，复读合同无法整段重扫', () => {
  const replace = qualification.events.find((event) => event[0] === 'replace');
  const query = qualification.events[qualification.events.indexOf(replace) + 1];
  const pageStart = replace[2] * qualification.pageSize;
  assert.ok(query[2] <= pageStart && pageStart < query[3]);
  assert.ok(qualification.changedReadLimit < qualification.frames / qualification.pageSize);
  assert.ok(qualification.frames * qualification.textLength * 8 > qualification.residentBytes);
});
