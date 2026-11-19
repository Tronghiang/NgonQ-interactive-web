// Supabase – lưu lượt chọn trên mạng, máy nào mở web cũng thấy cùng số liệu.
// Bảng `votes` (flavor_id, created_at, archived) + view `vote_counts`.
// Reset = đánh dấu archived = true (không xoá, vẫn còn trong Supabase).
import { APP_CONFIG } from '../../../config/app.config.js';

const { url, anonKey } = APP_CONFIG.supabase;
const API = `${url}/rest/v1`;
const HEADERS = { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' };

async function req(path, opts = {}) {
  const r = await fetch(`${API}/${path}`, { ...opts, headers: { ...HEADERS, ...opts.headers } });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  const text = await r.text(); // insert/update trả về rỗng
  return text ? JSON.parse(text) : null;
}

async function results() {
  const rows = await req('vote_counts?select=flavor_id,votes');
  const counts = Object.fromEntries(rows.map((r) => [r.flavor_id, Number(r.votes)]));
  return { total: Object.values(counts).reduce((s, n) => s + n, 0), counts };
}

export const supabaseAdapter = {
  async vote(flavorId) {
    await req('votes', { method: 'POST', body: JSON.stringify({ flavor_id: flavorId }), headers: { Prefer: 'return=minimal' } });
    return results();
  },
  results,
  async reset() {
    await req('votes?archived=eq.false', { method: 'PATCH', body: JSON.stringify({ archived: true }), headers: { Prefer: 'return=minimal' } });
    return results();
  },
  async exportRows() {
    // lấy theo từng trang 1000 dòng (giới hạn mặc định của Supabase)
    const all = [];
    for (let from = 0; ; from += 1000) {
      const page = await req(`votes?select=flavor_id,created_at&archived=eq.false&order=id&offset=${from}&limit=1000`);
      all.push(...page);
      if (page.length < 1000) return all;
    }
  },
};
