export const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'karin', label: 'Karın' },
  { id: 'sindirim', label: 'Sindirim' },
  { id: 'enerji', label: 'Enerji' },
  { id: 'dogum', label: 'Doğum sonrası' }
];

// Match only themes supported by the selected problem's actual wording.
const GOAL_CATEGORIES = {
  1: ['dogum', 'karin'], 2: ['karin'], 3: ['karin'], 5: ['karin'],
  6: ['sindirim'], 7: ['sindirim'], 8: ['sindirim'], 9: ['sindirim'],
  10: ['enerji'], 12: ['enerji'], 13: ['karin'], 14: ['enerji'],
  15: ['enerji'], 16: ['enerji'], 18: ['karin'], 19: ['enerji']
};
const PRIORITY = ['dogum', 'sindirim', 'karin', 'enerji'];

export function recommendCategory(goalIds) {
  const scores = Object.fromEntries(PRIORITY.map(id => [id, 0]));
  for (const goal of new Set(goalIds.map(String))) {
    for (const category of GOAL_CATEGORIES[goal] || []) scores[category] += 1;
  }
  let result = 'all';
  let score = 0;
  for (const category of PRIORITY) {
    if (scores[category] > score) {
      result = category;
      score = scores[category];
    }
  }
  return result;
}

export function filterReviews(reviews, category) {
  return category === 'all' ? [...reviews] : reviews.filter(review => review.categories.includes(category));
}

export function dotIndices(index, count) {
  const size = Math.min(5, count);
  const first = Math.max(0, Math.min(index - 2, count - size));
  return Array.from({ length: size }, (_, offset) => first + offset);
}

export function fitImageWidth(review, viewportWidth, viewportHeight) {
  return Math.max(1, Math.min(viewportWidth - 32, (viewportHeight - 32) * review.width / review.height, review.width));
}
