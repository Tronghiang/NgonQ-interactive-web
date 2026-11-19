// Hẹn giờ "không ai chạm thì làm X". start() lần nữa = đếm lại từ đầu.
export function createIdleTimer(seconds, onIdle) {
  let t = null;
  return {
    start() { clearTimeout(t); t = setTimeout(onIdle, seconds * 1000); },
    stop() { clearTimeout(t); t = null; },
  };
}
