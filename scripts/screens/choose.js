// Màn 1 – chọn vị
import { $ } from '../core/dom.js';
import { emit } from '../core/events.js';
import { FLAVORS } from '../config/flavors.js';
import { FlavorCard } from '../components/flavor-card.js';
import { vote } from '../services/data/index.js';

export function initChoose() {
  const grid = $('#flavorGrid');
  const confirm = $('#confirmBtn');
  let selected = null;
  let busy = false;

  grid.innerHTML = FLAVORS.map(FlavorCard).join('');

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.flavor-card');
    if (!card) return;
    selected = card.dataset.id;
    grid.classList.add('has-pick');
    grid.querySelectorAll('.flavor-card').forEach((c) => c.setAttribute('aria-pressed', c === card));
    confirm.disabled = false;
  });

  confirm.addEventListener('click', async () => {
    if (!selected || busy) return;
    busy = true; // khoá tới khi reset() – tránh khách bấm 2 lần
    // thẻ đã chọn nảy nhẹ để xác nhận
    grid.querySelector(`[data-id="${selected}"]`)?.animate(
      [{ scale: 1 }, { scale: 1.06 }, { scale: 1 }],
      { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' },
    );
    // Gửi lượt chọn NGAY, nhưng không chờ: animation chuyển trang chạy song song,
    // tới lúc vải phủ kín mới cần kết quả.
    emit('vote:submit', { pickedId: selected, pending: vote(selected) });
  });

  function clearPick() {
    selected = null;
    grid.classList.remove('has-pick');
    grid.querySelectorAll('.flavor-card').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    confirm.disabled = true;
  }

  // Chạm ra ngoài (không trúng thẻ, nút chọn hay nút cài đặt) → bỏ chọn, về trạng thái ban đầu
  $('#choose').addEventListener('click', (e) => {
    if (busy || !selected) return;
    if (e.target.closest('.flavor-card, #confirmBtn, [data-open-settings]')) return;
    clearPick();
  });

  return {
    reset() {
      busy = false;
      clearPick();
    },
  };
}
