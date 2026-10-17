import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { REVIEWS } from '../assets/reviews-data.mjs';
import { recommendCategory, filterReviews, dotIndices, fitImageWidth } from '../assets/reviews-logic.mjs';

test('All 14 approved screenshots, quotes and categories stay authentic', async () => {
  const provenance = JSON.parse(await readFile(new URL('../source/reviews-provenance.json', import.meta.url)));
  assert.equal(REVIEWS.length, 14);
  assert.deepEqual([...REVIEWS.map(review => review.id)].sort((a, b) => a - b), Array.from({ length: 14 }, (_, i) => i + 1));
  for (const review of REVIEWS) {
    const approved = provenance.reviews.find(item => item.id === review.id);
    const bytes = await readFile(new URL(`../assets/reviews/${review.id}.jpg`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), approved.sha256);
    assert.equal(review.quote, approved.quote);
    assert.equal(review.src, `./assets/reviews/${review.id}.jpg`);
  }
});

test('Filters include every approved matching review, including multiple topics', () => {
  const ids = category => filterReviews(REVIEWS, category).map(review => review.id).sort((a, b) => a - b);
  assert.equal(ids('all').length, 14);
  assert.deepEqual(ids('karin'), [4, 7, 9, 10]);
  assert.deepEqual(ids('sindirim'), [2, 4, 9, 10]);
  assert.deepEqual(ids('enerji'), [2, 4, 7, 9, 10, 11, 13]);
  assert.deepEqual(ids('dogum'), [7]);
});

test('Recommendations use the dominant topic and stable tie priority', () => {
  assert.equal(recommendCategory([]), 'all');
  assert.equal(recommendCategory(['4', '11', '17']), 'all');
  assert.equal(recommendCategory(['1']), 'dogum');
  assert.equal(recommendCategory(['6', '8']), 'sindirim');
  assert.equal(recommendCategory(['2', '18']), 'karin');
  assert.equal(recommendCategory(['14', '16']), 'enerji');
  assert.equal(recommendCategory(['1', '6']), 'dogum');
  assert.equal(recommendCategory(['6', '2']), 'sindirim');
  assert.equal(recommendCategory(['1', '2']), 'karin');
  assert.equal(recommendCategory(['6', '6', '2', '18']), 'karin');
});

test('Compact dots always include the active review and remain in range', () => {
  for (const count of [1, 4, 7, 14]) {
    for (let index = 0; index < count; index++) {
      const dots = dotIndices(index, count);
      assert.equal(dots.length, Math.min(5, count));
      assert.ok(dots.includes(index));
      assert.ok(dots.every(dot => dot >= 0 && dot < count));
      assert.equal(new Set(dots).size, dots.length);
    }
  }
});

test('Full-view fit respects original aspect ratio, viewport and native resolution', () => {
  for (const review of REVIEWS) {
    for (const [width, height] of [[320, 650], [390, 710], [1400, 750]]) {
      const fittedWidth = fitImageWidth(review, width, height);
      assert.ok(fittedWidth <= width - 32);
      assert.ok(fittedWidth <= review.width);
      assert.ok(fittedWidth * review.height / review.width <= height - 32 + .00001);
    }
  }
});
