import assert from 'node:assert/strict';
import fs from 'node:fs';
import {schemaDate} from '../lib/schema-date.ts';

for (const [input, expected] of [
  ['20/10/2026', '2026-10-20'],
  ['1/2/2026', '2026-02-01'],
  ['29/02/2024', '2024-02-29'],
  ['2026-10-20', '2026-10-20'],
  ['2026-10-20T01:06:23.980Z', '2026-10-20T01:06:23.980Z'],
  ['2026-10-20T08:06:23+07:00', '2026-10-20T08:06:23+07:00'],
  ['2026-10-20T08:06', '2026-10-20T08:06+07:00'],
  [' 20/10/2026 ', '2026-10-20'],
  ['', undefined], [null, undefined], [undefined, undefined],
  ['31/02/2026', undefined], ['29/02/2026', undefined],
  ['2026-02-30T01:00:00Z', undefined], ['2026-13-01', undefined],
  ['2026-10-20T25:00:00Z', undefined], ['2026-10-20T08:00:00+14:30', undefined],
  ['10-20-2026', undefined], ['not a date', undefined],
]) assert.equal(schemaDate(input), expected, String(input));

const page = fs.readFileSync(new URL('../app/guide/[slug]/page.tsx', import.meta.url), 'utf8');
assert.ok(page.includes('datePublished:schemaDate(cms.date)'));
assert.ok(page.includes('dateModified:schemaDate(cms.updatedAt)||schemaDate(cms.date)'));
assert.ok(!page.includes('datePublished:cms.date||undefined'));
console.log('Article schema date regression checks passed (19 cases and route integration).');
