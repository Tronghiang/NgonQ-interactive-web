// Component: bảng đếm lượt trong cài đặt. Style: styles/components/tally.css
import { esc } from '../core/dom.js';

export const TallyRows = ({ total, flavors }) =>
  flavors.map((f) =>
    `<tr><td><i class="tally__swatch" style="--c:${f.color}"></i>${esc(f.name)}</td><td>${f.votes}</td></tr>`,
  ).join('') + `<tr class="tally__sum"><td>Total</td><td>${total}</td></tr>`;
