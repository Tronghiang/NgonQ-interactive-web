// =====================================================================
//  Chuyển trang "Siêu nhân kéo vải"
//
//  1. ENTER   siêu nhân bay vào từ NGOÀI mép màn hình (mặc định: mép dưới),
//             áo choàng dài kéo theo sau; chậm lại, lơ lửng một nhịp.
//  2. DASH    lấy đà (lùi nhẹ) rồi vút đi, áo choàng nở thành tấm vải
//             khổng lồ phủ kín màn, siêu nhân bay ra khỏi mép đối diện.
//  3. SWAP    ngay khi vải phủ kín (và dữ liệu đã lưu xong) → đổi sang trang 2.
//             Nếu dữ liệu chưa xong, vải tiếp tục phấp phới chờ.
//  4. REVEAL  đuôi vải lướt theo, lộ trang kết quả.
//
//  Toán được viết trong một hệ trục "bay" riêng:
//    along  = quãng đường dọc hướng bay (0 = mép xuất phát, L = mép đích)
//    across = vị trí ngang hướng bay (0..B)
//  rồi xoay ra màn hình theo DIRECTIONS → đổi hướng bay chỉ cần đổi config.
//
//  Chạy trong 1 vòng requestAnimationFrame theo thời gian thực
//  (không phụ thuộc FPS), chỉ đổi transform / path → mượt trên tablet.
// =====================================================================
import { HERO_WIPE as M } from '../config/motion.js';
import { ASSETS } from '../config/assets.js';

const SVG = 'http://www.w3.org/2000/svg';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = {
  outCubic: (t) => 1 - (1 - t) ** 3,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  /** lùi nhẹ lấy đà (~4%) rồi tăng tốc phóng đi */
  inBack: (t) => 2 * t ** 3 - t ** 2,
};

/** Hướng bay: kích thước hệ trục bay + cách đổi (along, across) ra toạ độ màn hình */
const DIRECTIONS = {
  up: {
    size: (W, H) => ({ L: H, B: W }),
    toScreen: (a, c, W, H) => [c, H - a],
    matrix: (W, H) => `matrix(0,-1,1,0,0,${H})`,
    stretchAxis: 'y',
  },
  right: {
    size: (W, H) => ({ L: W, B: H }),
    toScreen: (a, c) => [a, c],
    matrix: () => 'matrix(1,0,0,1,0,0)',
    stretchAxis: 'x',
  },
};

// ---------- DOM (tạo 1 lần, dùng lại) ----------
let el = null;
function build() {
  if (el) return el;
  const root = document.createElement('div');
  root.className = 'hero-wipe';
  root.hidden = true;
  root.setAttribute('aria-hidden', 'true');

  const svg = document.createElementNS(SVG, 'svg');
  svg.classList.add('hero-wipe__cloth');
  svg.innerHTML = `
    <defs><clipPath id="heroWipeClip"><path/></clipPath></defs>
    <g class="hero-wipe__space">
      <path class="hero-wipe__fill"/>
      <g clip-path="url(#heroWipeClip)">
        <path class="hero-wipe__fold"/><path class="hero-wipe__fold"/><path class="hero-wipe__fold"/>
        <path class="hero-wipe__shine"/>
      </g>
      <path class="hero-wipe__edge"/>
    </g>`;

  const hero = document.createElement('img');
  hero.className = 'hero-wipe__hero';
  hero.src = ASSETS.hero;
  hero.alt = '';

  root.append(svg, hero);
  document.body.append(root);

  el = {
    root, svg, hero,
    space: svg.querySelector('.hero-wipe__space'),
    clip: svg.querySelector('clipPath path'),
    fill: svg.querySelector('.hero-wipe__fill'),
    edge: svg.querySelector('.hero-wipe__edge'),
    folds: [...svg.querySelectorAll('.hero-wipe__fold')],
    shine: svg.querySelector('.hero-wipe__shine'),
  };
  return el;
}

/** Tải sẵn ảnh để lần bay đầu tiên không bị giật */
export function preloadHeroWipe() {
  const img = build().hero;
  img.decode?.().catch(() => {});
}

// ---------- Vẽ (toàn bộ trong hệ trục bay) ----------
const f1 = (n) => Math.round(n * 10) / 10;

/** Đường cong mượt qua các điểm (trung điểm + Q) */
function smooth(pts, move = true) {
  let d = move ? `M${f1(pts[0][0])},${f1(pts[0][1])}` : `L${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const mx = (x + pts[i + 1][0]) / 2, my = (y + pts[i + 1][1]) / 2;
    d += `Q${f1(x)},${f1(y)} ${f1(mx)},${f1(my)}`;
  }
  const last = pts[pts.length - 1];
  return d + `L${f1(last[0])},${f1(last[1])}`;
}

/**
 * Tấm vải = dải giữa mép trước (gắn vào siêu nhân) và mép sau (đuôi).
 * u ∈ [-1, 1] chạy ngang qua bề rộng tấm vải.
 * Mép trước hẹp (spreadLead – siêu nhân nắm), đuôi rộng (spreadTail) → dáng áo choàng.
 * Cả hai mép cong vì vải bị kéo từ giữa (chỗ siêu nhân).
 */
const N = 36;
function leadA(s, u) {
  return s.lead - s.bulge * u * u + s.amp * 0.7 * Math.abs(u) * Math.sin(u * 3.2 + s.phase);
}
function tailA(s, u) {
  return s.tail - s.drag * u * u + s.amp * Math.sin(u * 4.6 - s.phase * 1.3);
}

function draw(e, s) {
  const lead = [], tail = [];
  for (let i = 0; i <= N; i++) {
    const u = -1 + (2 * i) / N;
    lead.push([leadA(s, u), s.mid + u * s.spreadLead]);
    tail.push([tailA(s, u), s.mid + u * s.spreadTail]);
  }
  tail.reverse();
  // vai áo choàng: nối mép trước → đuôi bằng đường cong loe ra (không gãy góc)
  const shoulder = (from, to) =>
    `Q${f1(lerp(from[0], to[0], 0.35))},${f1(to[1])} ${f1(to[0])},${f1(to[1])}`;
  const d = smooth(lead) + shoulder(lead[N], tail[0]) + smooth(tail, false)
    + shoulder(tail[N], lead[0]) + 'Z';
  e.fill.setAttribute('d', d);
  e.edge.setAttribute('d', d);
  e.clip.setAttribute('d', d);

  // nếp gấp chạy dọc theo hướng bay, chụm dần về phía siêu nhân
  const a0 = s.tail - s.drag - s.amp * 2, a1 = s.lead + s.amp;
  const line = (u, k) => {
    const pts = [];
    for (let i = 0; i <= 18; i++) {
      const k01 = i / 18, a = lerp(a0, a1, k01);
      const spread = lerp(s.spreadTail, s.spreadLead, k01 ** 1.5);
      pts.push([a, s.mid + u * spread + Math.sin(a / (s.L * 0.18) - s.phase * k) * s.amp * 1.4]);
    }
    return smooth(pts);
  };
  const w = (s.spreadLead + s.spreadTail) / 2;
  [[-0.5, 1], [0.08, 1.2], [0.58, 0.9]].forEach(([u, k], i) => {
    e.folds[i].setAttribute('d', line(u, k));
    e.folds[i].style.strokeWidth = f1(w * (i === 1 ? 0.11 : 0.07));
  });
  e.shine.setAttribute('d', line(-0.22, 1.1));
  e.shine.style.strokeWidth = f1(w * 0.025);
}

// ---------- Chạy ----------
/**
 * @param {{ onCovered: () => Promise<void>|void, from?: HTMLElement }} opts
 *   onCovered – gọi đúng 1 lần khi vải phủ kín: đổi màn ở đây.
 * @returns {Promise<void>} xong khi vải đã rời màn hình.
 */
export function playHeroWipe({ onCovered, from }) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Promise.resolve(onCovered());
  }

  const e = build();
  const dir = DIRECTIONS[M.direction] || DIRECTIONS.up;
  const W = innerWidth, H = innerHeight;
  const { L, B } = dir.size(W, H);
  const heroW = Math.min(W, H) * M.heroSize;
  const heroH = heroW * (e.hero.naturalHeight / e.hero.naturalWidth || 0.7);
  // bề dài / bề ngang của siêu nhân tính theo hệ trục bay
  const [heroAlong, heroAcross] = dir.stretchAxis === 'y' ? [heroH, heroW] : [heroW, heroH];

  const startA = -heroAlong * 0.9 - L * 0.05;   // ngoài mép xuất phát
  const hoverA = L * M.hoverAt;                 // chỗ lơ lửng lấy đà
  const midC = B * M.across;

  e.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  e.space.setAttribute('transform', dir.matrix(W, H));
  e.hero.style.width = `${heroW}px`;
  e.root.hidden = false;

  // trang 1 lùi nhẹ ra sau khi siêu nhân lao tới
  const recede = from?.animate(
    [{ transform: 'none' }, { transform: 'scale(.965)', opacity: 0.85 }],
    { duration: M.enterMs + M.dashMs, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'forwards' },
  );

  // áo choàng lúc bình thường (so với kích thước siêu nhân)
  const lead0 = heroAcross * 0.2, tail0 = heroAcross * 0.38;
  const capeLen = heroAlong * 1.1;

  return new Promise((resolve) => {
    const t0 = performance.now();
    let covered = false, ready = false, revealAt = null, revealFrom = 0;
    let prevA = startA, prevT = t0, stretch = 0;
    const s = { L, mid: midC, lead: startA, tail: startA, spreadLead: lead0, spreadTail: tail0, bulge: 0, drag: 0, amp: 0, phase: 0 };

    function frame(now) {
      const t = now - t0;
      s.phase = (t / 1000) * M.waveSpeed;

      // ---- vị trí siêu nhân (hệ trục bay) ----
      let a, c, rot;
      if (t < M.enterMs) {
        // bay vào từ ngoài màn, chậm dần tới chỗ lơ lửng
        const p = t / M.enterMs, o = ease.outCubic(p);
        a = lerp(startA, hoverA, o);
        c = midC + Math.sin(p * Math.PI) * B * 0.04;           // hơi lượn
        rot = Math.sin(p * Math.PI * 1.5) * 6;
        s.lead = a;
        s.tail = a - lerp(capeLen * 1.6, capeLen, o);          // bay nhanh → áo choàng dài
        s.spreadLead = lead0;
        s.spreadTail = tail0;
        s.bulge = lead0 * 0.5;
        s.drag = tail0 * 0.5;
        s.amp = tail0 * 0.1;
      } else {
        // lấy đà rồi vút qua, áo choàng nở thành tấm vải
        const p = clamp((t - M.enterMs) / M.dashMs), m = ease.inBack(p);
        a = lerp(hoverA, L + heroAlong * 2.4, m);
        c = midC - Math.sin(Math.PI * p) * B * 0.05;
        rot = Math.sin(p * Math.PI) * -5;
        const grow = ease.inOutCubic(clamp((p - 0.12) / 0.75));
        s.lead = a;
        s.spreadLead = lerp(lead0, B * 0.78, grow);
        s.spreadTail = lerp(tail0, B * 1.15, grow);
        s.bulge = lerp(lead0 * 0.5, L * 0.22, grow);
        s.drag = lerp(tail0 * 0.5, L * 0.1, grow);
        s.amp = lerp(tail0 * 0.1, L * M.flutter, ease.outCubic(p));
        if (revealAt === null) {
          s.tail = lerp(hoverA - capeLen, -L * 0.08 - s.amp * 2, ease.outCubic(clamp(p * 1.7)));
        }
      }
      s.mid = c;

      // ---- phủ kín chưa? → đổi màn ----
      if (!covered && t > M.enterMs) {
        let ok = s.mid - s.spreadLead < -4 && s.mid + s.spreadLead > B + 4;
        for (let i = 0; ok && i <= 12; i++) {
          const x = (B * i) / 12;
          ok = leadA(s, (x - s.mid) / s.spreadLead) > L + 4 && tailA(s, (x - s.mid) / s.spreadTail) < -4;
        }
        if (ok) {
          covered = true;
          recede?.cancel();
          Promise.resolve().then(onCovered).catch((err) => console.error(err)).finally(() => { ready = true; });
        }
      }

      // ---- đuôi vải lướt đi, lộ trang mới ----
      if (covered && ready && revealAt === null) { revealAt = now; revealFrom = s.tail; }
      if (revealAt !== null) {
        const r = clamp((now - revealAt) / M.revealMs);
        s.tail = lerp(revealFrom, L + s.drag + s.amp * 3 + L * 0.15, ease.inOutSine(r));
        s.lead = Math.max(s.lead, s.tail + L * 0.3);
        if (r >= 1) {
          e.root.hidden = true;
          return resolve();
        }
      }

      // ---- giãn theo tốc độ (lấy đà thì bẹp, phóng thì dài ra) ----
      const dt = Math.max(1, now - prevT);
      const v = clamp((a - prevA) / dt / (L / 500), -0.6, 1);
      stretch = lerp(stretch, v, 0.25);
      prevA = a; prevT = now;
      const long = 1 + 0.14 * stretch, wide = 1 - 0.07 * stretch;
      const [sx, sy] = dir.stretchAxis === 'y' ? [wide, long] : [long, wide];

      const [x, y] = dir.toScreen(a, c, W, H);
      e.hero.style.transform =
        `translate3d(${f1(x - heroW / 2)}px, ${f1(y - heroH / 2)}px, 0) rotate(${f1(rot)}deg) ` +
        `scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;

      draw(e, s);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}
