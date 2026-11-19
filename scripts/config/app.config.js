// =====================================================================
//  Cấu hình chạy app – mọi "nút vặn" nằm ở đây, không rải trong code.
// =====================================================================

export const APP_CONFIG = {
  /** Nơi lưu lượt chọn: 'browser' | 'server' | 'supabase' */
  dataMode: 'supabase',

  /** Theme đang dùng – khớp với [data-theme] trong styles/tokens|themes */
  theme: 'ngonq',

  /** Mã PIN mở cài đặt nhân viên – nhớ đổi trước khi mang đi (server/config.js có PIN riêng) */
  adminPin: '1234',

  /** Màn kết quả tự quay về màn đầu sau N giây không ai chạm */
  autoBackSeconds: 120, // 2 phút

  /** Supabase – điền khi chuyển sang dataMode 'supabase' */
  supabase: {
    url: 'https://yenfccoefczqxckbizqa.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbmZjY29lZmN6cXhja2JpenFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDkyNzksImV4cCI6MjA2MTUyNTI3OX0.U1iQUOaNPSrEHf1w_ePqgYzJiRO6Bi48E2Np2hY0nCQ',
  },
};
