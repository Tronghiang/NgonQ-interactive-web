// Lưu ngay trong trình duyệt của tablet (không cần mạng, không cần laptop).
// Cấu trúc mỗi dòng giống bảng `votes` trên Supabase: { flavor_id, created_at }
const KEY = 'ngonq.votes.v1'; // GIỮ NGUYÊN để không mất dữ liệu đã lưu

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = (rows) => { try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch {} };

const tally = (rows) => {
  const counts = {};
  for (const r of rows) counts[r.flavor_id] = (counts[r.flavor_id] || 0) + 1;
  return { total: rows.length, counts };
};

export const browserAdapter = {
  async vote(flavorId) {
    const rows = read();
    rows.push({ flavor_id: flavorId, created_at: new Date().toISOString() });
    write(rows);
    return tally(rows);
  },
  async results() { return tally(read()); },
  async reset() {
    const rows = read();
    if (rows.length) { // giữ bản sao lượt cũ, phòng khi lỡ tay
      try { localStorage.setItem(`ngonq.backup.${Date.now()}`, JSON.stringify(rows)); } catch {}
    }
    write([]);
    return tally([]);
  },
  async exportRows() { return read(); },
};
