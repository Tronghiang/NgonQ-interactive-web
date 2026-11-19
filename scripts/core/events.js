// Kênh sự kiện nhỏ để các màn hình nói chuyện với nhau mà không import chéo.
// Sự kiện đang dùng: 'vote:done' {results, pickedId}, 'round:reset', 'go:home'
const bus = new EventTarget();

export const emit = (type, detail) => bus.dispatchEvent(new CustomEvent(type, { detail }));
export const on = (type, fn) => {
  const h = (e) => fn(e.detail);
  bus.addEventListener(type, h);
  return () => bus.removeEventListener(type, h);
};
