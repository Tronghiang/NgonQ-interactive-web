// Chuyển màn hình: chỉ bật data-active trên <main class="screen" id="...">
import { $$ } from './dom.js';

const listeners = new Set();

export function show(id) {
  $$('.screen').forEach((s) => s.toggleAttribute('data-active', s.id === id));
  listeners.forEach((fn) => fn(id));
}

export const current = () => $$('.screen').find((s) => s.hasAttribute('data-active'))?.id;

/** Lắng nghe khi đổi màn – chỗ móc animation chuyển cảnh ở giai đoạn 2 */
export const onNavigate = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
