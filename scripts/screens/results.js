// Màn 2 – biểu đồ kết quả
import { $, esc } from '../core/dom.js';
import { emit } from '../core/events.js';
import { BarChart } from '../components/bar-chart.js';

export function initResults({ idle }) {
  const screen = $('#results');

  $('#backBtn').addEventListener('click', () => emit('go:home'));
  // chạm vào màn kết quả thì tính lại thời gian tự quay về
  screen.addEventListener('pointerdown', (e) => { if (!e.target.closest('#backBtn')) idle.start(); });

  return {
    render({ total, flavors }, pickedId) {
      const picked = flavors.find((f) => f.id === pickedId);
      if (picked) {
        const others = picked.votes - 1;
        $('#resultTitle').innerHTML = `<span class="title__eyebrow">You picked</span> <span class="hl" style="--c:${picked.color}">${esc(picked.name)}!</span>`;
        $('#resultSub').textContent = others > 0
          ? `You and ${others} other${others === 1 ? '' : 's'} love this flavor.`
          : 'You\'re the first to pick this flavor!';
      }

      $('#chart').innerHTML = BarChart({ total, flavors, pickedId });
    },
  };
}
