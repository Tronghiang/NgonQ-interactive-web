// =====================================================================
//  Nút vặn chuyển động – chỉnh tốc độ / cảm giác ở đây.
//  Màu tấm vải nằm trong styles/tokens/semantic.css (--hero-cloth-*)
// =====================================================================

export const HERO_WIPE = {
  /** Hướng bay: 'up' (từ dưới lên) | 'right' (từ trái sang phải) */
  direction: 'right',

  /** Bay vào từ ngoài màn hình tới chỗ lơ lửng */
  enterMs: 330,
  /** Lấy đà rồi vút qua, kéo tấm vải phủ kín trang */
  dashMs: 480,
  /** Đuôi tấm vải lướt qua, lộ trang kết quả */
  revealMs: 500,

  /** Kích thước siêu nhân so với cạnh ngắn màn hình */
  heroSize: 0.27,
  /** Chỗ lơ lửng: tỉ lệ quãng đường bay (0 = mép xuất phát, 1 = mép đích) */
  hoverAt: 0.36,
  /** Vị trí ngang hướng bay (0.5 = chính giữa; bay ngang: tỉ lệ chiều cao) */
  across: 0.55,

  /** Độ phấp phới của mép vải (tỉ lệ chiều dài quãng bay) */
  flutter: 0.022,
  /** Tốc độ sóng vải (rad/giây) */
  waveSpeed: 11,

  /** Biểu đồ bắt đầu chạy sau khi vải mở được bao lâu */
  chartDelayMs: 220,
};
