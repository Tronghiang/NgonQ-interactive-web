// =====================================================================
//  NGONQ Macaball – điểm khởi động. Chỉ "nối dây" giữa các màn hình,
//  không chứa logic giao diện chi tiết.
// =====================================================================
import './core/stage.js'; // phải chạy đầu tiên: phóng khung thiết kế cho vừa màn hình
import { APP_CONFIG } from './config/app.config.js';
import { show, current } from './core/router.js';
import { on } from './core/events.js';
import { createIdleTimer } from './core/idle-timer.js';
import { initChoose } from './screens/choose.js';
import { initResults } from './screens/results.js';
import { initSettings } from './screens/settings.js';
import { playHeroWipe, preloadHeroWipe } from './transitions/hero-wipe.js';
import { HERO_WIPE } from './config/motion.js';
import { $ } from './core/dom.js';

document.documentElement.dataset.theme = APP_CONFIG.theme;

const idle = createIdleTimer(APP_CONFIG.autoBackSeconds, goHome);
const choose = initChoose();
const results = initResults({ idle });
initSettings({
  onOpen: () => idle.stop(),
  onClose: () => { if (current() === 'results') idle.start(); },
});

function goHome() {
  idle.stop();
  choose.reset();
  show('choose');
}

preloadHeroWipe();

// Khách bấm chọn → siêu nhân kéo vải → (vải phủ kín) đổi màn → vải mở ra
on('vote:submit', async ({ pickedId, pending }) => {
  let ok = true;
  await playHeroWipe({
    from: $('#choose'),
    onCovered: async () => {
      try {
        const data = await pending;
        $('#chart').style.setProperty('--chart-delay', `${HERO_WIPE.chartDelayMs}ms`);
        results.render(data, pickedId);
        show('results');
      } catch (err) {
        ok = false; // lưu lỗi → mở vải ra lại trang chọn
        console.error(err);
        choose.reset();
      }
    },
  });
  if (ok) idle.start();
});
on('go:home', goHome);
on('round:reset', goHome);
