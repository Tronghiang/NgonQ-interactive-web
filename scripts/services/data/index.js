// =====================================================================
//  LỚP DỮ LIỆU – giao diện CHỈ gọi các hàm ở file này.
//  Đổi nơi lưu (trình duyệt → laptop → Supabase) = đổi APP_CONFIG.dataMode.
//
//  Mọi adapter phải có đủ 4 hàm (cùng "hợp đồng"):
//    vote(flavorId)  → Results
//    results()       → Results
//    reset(pin)      → Results
//    exportRows()    → [{ flavor_id, created_at }] | null (null = server tự xuất)
//  Results = { total: number, counts: { [flavorId]: number } }
// =====================================================================
import { APP_CONFIG } from '../../config/app.config.js';
import { FLAVORS } from '../../config/flavors.js';
import { browserAdapter } from './adapters/browser.js';
import { serverAdapter } from './adapters/server.js';
import { supabaseAdapter } from './adapters/supabase.js';

const ADAPTERS = { browser: browserAdapter, server: serverAdapter, supabase: supabaseAdapter };
const adapter = ADAPTERS[APP_CONFIG.dataMode];
if (!adapter) throw new Error(`Invalid dataMode: ${APP_CONFIG.dataMode}`);

/** Ghép số đếm với thông tin vị để giao diện dùng thẳng */
const withFlavors = ({ total, counts }) => ({
  total,
  flavors: FLAVORS.map((f) => ({ ...f, votes: counts[f.id] || 0 })),
});

export const DATA_MODE = APP_CONFIG.dataMode;
export const vote = async (flavorId) => withFlavors(await adapter.vote(flavorId));
export const getResults = async () => withFlavors(await adapter.results());
export const resetRound = async (pin) => withFlavors(await adapter.reset(pin));
export const exportRows = () => adapter.exportRows();
