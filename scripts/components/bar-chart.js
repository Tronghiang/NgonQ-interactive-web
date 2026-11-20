// Component: biểu đồ cột. Style: styles/components/bar-chart.css
import { esc } from '../core/dom.js';
import { ASSETS } from '../config/assets.js';

/** @param {{ total:number, flavors:Array, pickedId?:string }} p */
export function BarChart({ total, flavors, pickedId }) {
  const top = Math.max(...flavors.map((f) => f.votes));
  const max = Math.max(1, top);

  const bars = flavors.map((f, i) => {
    const pct = total ? Math.round((f.votes / total) * 100) : 0;
    const lead = top > 0 && f.votes === top;
    const mine = f.id === pickedId;
    return `
      <div class="bar-chart__bar ${lead ? 'is-lead' : ''}" style="--c:${f.color};--ink:${f.ink};--r:${(f.votes / max).toFixed(3)};--i:${i}">
        ${lead ? `<img class="bar-chart__crown" src="${ASSETS.crown}" alt="Leading">` : ''}
        ${mine ? '<span class="bar-chart__you" aria-label="Your pick">Your pick<i aria-hidden="true"></i></span>' : ''}
        <span class="bar-chart__pct">${pct}<small>%</small></span>
        <span class="bar-chart__votes">${f.votes} ${f.votes === 1 ? 'pick' : 'picks'}</span>
      </div>`;
  }).join('');

  const labels = flavors.map((f) => {
    const mine = f.id === pickedId;
    return `
      <div class="bar-chart__label ${mine ? 'is-mine' : ''}">
        <img class="bar-chart__title" src="${f.images.title}" alt="${esc(f.name)}">
      </div>`;
  }).join('');

  return `
    <div class="bar-chart">
      <div class="bar-chart__bars">${bars}</div>
      <div class="bar-chart__labels">${labels}</div>
    </div>`;
}
