// =====================================================================
//  NỘI DUNG 4 vị – chỉ dữ liệu, không có màu cứng.
//  Màu lấy từ design token: --flavor-<id>-bg / --flavor-<id>-ink
//  (styles/tokens/semantic.css) → đổi theme là màu vị đổi theo.
// =====================================================================

const IMG = 'assets/images/products';
const TITLES = 'assets/images/titles';

// Ảnh mặt trước trên thẻ chọn vị. Muốn dùng ảnh động: bỏ file vào
// assets/images/products/ rồi đổi đuôi ở đây (.gif, .webp, .png APNG, .mp4).
const FRONT_EXT = { cheese: 'png', butter: 'png', wasabi: 'png', bbq: 'png' };

// Bao bì động (ghép lớp): nền bao bì đã xoá nhân vật + nhân vật động đặt lên trên.
// box = vị trí nhân vật, tính theo % khung bao bì (left, top, width).
const ANIM = 'assets/images/mascots/anim';
const ART = {
  cheese: {
    bg: `${IMG}/pack-cheese-bg.png`,
    anim: `${ANIM}/cheese.gif`, box: { left: 5, top: 29.2, width: 90 },
    title: `${TITLES}/pack-title-cheese.png`, titleBox: { left: 13.68, top: 10.1, width: 72.64 },
  },
  butter: {
    bg: `${IMG}/pack-butter-bg.png`,
    anim: `${ANIM}/butter.gif`, box: { left: 5, top: 33, width: 90 },
    title: `${TITLES}/pack-title-butter.png`, titleBox: { left: 12.9, top: 10.35, width: 72.8 },
  },
  wasabi: {
    bg: `${IMG}/pack-wasabi-bg.png`,
    anim: `${ANIM}/wasabi.gif`, box: { left: 5, top: 25.5, width: 90 },
    // tên vị tách thành lớp riêng, đè lên nhân vật
    title: `${TITLES}/pack-title-wasabi.png`, titleBox: { left: 13.61, top: 10.1, width: 72.71 },
  },
  bbq: {
    bg: `${IMG}/pack-bbq-bg.png`,
    anim: `${ANIM}/bbq.gif`, box: { left: -2, top: 37, width: 104 },
    title: `${TITLES}/pack-title-bbq.png`, titleBox: { left: 12.19, top: 9.61, width: 78.58 },
  },
};

export const FLAVORS = [
  // name = tên sản phẩm; label = tên vị hiện trên thẻ chọn
  { id: 'cheese', name: 'Prinkle Cheese',  label: 'Cheese flavor' },
  { id: 'butter', name: 'Butta La Toasta', label: 'Garlic butter flavor' },
  { id: 'wasabi', name: 'Ayo Wassapi',     label: 'Wasabi flavor' },
  { id: 'bbq',    name: 'BBQ On Fire',     label: 'BBQ flavor' },
].map((f) => ({
  ...f,
  color: `var(--flavor-${f.id}-bg)`,
  ink: `var(--flavor-${f.id}-ink)`,
  images: {
    front: `${IMG}/pack-${f.id}.${FRONT_EXT[f.id]}`,
    pack: `${IMG}/pack-${f.id}.png`,
    bag: `${IMG}/bag-${f.id}.png`,
    title: `${TITLES}/title-${f.id}.png`,
  },
  art: ART[f.id] || null,
}));

export const FLAVOR_IDS = FLAVORS.map((f) => f.id);
export const flavorById = (id) => FLAVORS.find((f) => f.id === id);
