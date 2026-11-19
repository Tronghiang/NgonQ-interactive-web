// Component: thẻ chọn vị. Hàm thuần – nhận dữ liệu, trả HTML. Style: styles/components/flavor-card.css
import { esc } from '../core/dom.js';

const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src);

// Ảnh mặt trước: png/gif/webp/apng dùng <img>; mp4/webm dùng <video> tự chạy, lặp, không tiếng
const Media = (src) => isVideo(src)
  ? `<video class="flavor-card__media" src="${src}" autoplay muted loop playsinline disablepictureinpicture></video>`
  : `<img class="flavor-card__media" src="${src}" alt="">`;

// Bao bì ghép lớp: nền tĩnh + nhân vật động, giữ đúng tỉ lệ bao bì
// Bao bì phóng to lấp kín thẻ, cắt bỏ viền bao bì (crop trong CSS)
const Art = ({ bg, anim, box, title, titleBox }) => `
  <div class="flavor-card__art">
    <div class="flavor-card__art-box">
      ${isVideo(bg)
        ? `<video class="flavor-card__art-bg" src="${bg}" autoplay muted loop playsinline disablepictureinpicture></video>`
        : `<img class="flavor-card__art-bg" src="${bg}" alt="">`}
      ${anim ? `<img class="flavor-card__art-anim" src="${anim}" alt=""
           style="left:${box.left}%;top:${box.top}%;width:${box.width}%">` : ''}
      ${title ? `<img class="flavor-card__art-anim" src="${title}" alt=""
           style="left:${titleBox.left}%;top:${titleBox.top}%;width:${titleBox.width}%">` : ''}
    </div>
  </div>`;

export const FlavorCard = (f) => `
  <button class="flavor-card" data-id="${f.id}" style="--c:${f.color};--flavor-label:var(--flavor-${f.id}-label)" aria-pressed="false" aria-label="${esc(f.name)}">
    <span class="flavor-card__check" aria-hidden="true">✓</span>
    <span class="flavor-card__label">
      <span class="flavor-card__brand">NGONQ Macaball</span>
      <span class="flavor-card__name">${esc(f.label || f.name)}</span>
    </span>
    ${Art(f.art || { bg: f.images.front })}
  </button>`;
