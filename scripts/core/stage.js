// Phóng to / thu nhỏ khung thiết kế cố định (#stage) cho vừa màn hình, căn giữa.
// Kích thước khung nằm trong styles/base/stage.css (--stage-w / --stage-h).
const stage = document.getElementById('stage');

/** Kích thước khung thiết kế hiện tại (px, chưa phóng) */
export function stageSize() {
  return { W: stage.offsetWidth, H: stage.offsetHeight };
}

function fit() {
  const { W, H } = stageSize();
  const vw = innerWidth, vh = innerHeight;
  const s = Math.min(vw / W, vh / H);
  stage.style.setProperty('--stage-s', s);
  stage.style.setProperty('--stage-x', `${(vw - W * s) / 2}px`);
  stage.style.setProperty('--stage-y', `${(vh - H * s) / 2}px`);
}

fit();
addEventListener('resize', fit);
addEventListener('orientationchange', fit);
