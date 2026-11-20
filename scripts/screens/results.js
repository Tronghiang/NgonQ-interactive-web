// Màn 2 – biểu đồ kết quả
import { $, esc } from '../core/dom.js';
import { emit } from '../core/events.js';
import { BarChart } from '../components/bar-chart.js';
import { flavorById } from '../config/flavors.js';

const noOrphan = (t) => t.replace(/ (\S+)$/, '\u00A0$1');

export function initResults({ idle }) {
  const screen = $('#results');

  $('#backBtn').addEventListener('click', () => emit('go:home'));
  // chạm vào màn kết quả thì tính lại thời gian tự quay về
  screen.addEventListener('pointerdown', (e) => { if (!e.target.closest('#backBtn')) idle.start(); });

  return {
    render({ total, flavors }, pickedId) {
      const picked = flavors.find((f) => f.id === pickedId);
      const info = flavorById(pickedId);
      if (picked) {
        const others = picked.votes - 1;
        const cheer = `${esc(info?.cheer || 'Great pick!')}${info?.emoji ? ` ${info.emoji}` : ''}`;
        $('#resultTitle').innerHTML =
          `<span class="title__eyebrow"><span class="title__cheer">${cheer}</span>You're team</span> ` +
          `<span class="hl" style="--c:${picked.color}">${esc(picked.name)}</span>`;
        // nối 2 chữ cuối bằng khoảng trắng không ngắt → không còn 1 chữ mồ côi ở dòng cuối
        $('#resultTagline').textContent = noOrphan(info?.tagline || '');
        $('#resultSub').textContent = noOrphan(others > 0
          ? `You and ${others} other guest${others === 1 ? '' : 's'} picked this flavor`
          : 'You\'re the first guest to pick this flavor!');
      }

      $('#chart').innerHTML = BarChart({ total, flavors, pickedId });
    },
  };
}
