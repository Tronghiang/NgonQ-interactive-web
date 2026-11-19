// Server Node trên laptop (server/index.js) – tablet mở qua wifi.
const toCounts = (r) => ({
  total: r.total,
  counts: Object.fromEntries(r.flavors.map((f) => [f.id, f.votes])),
});

async function post(url, body) {
  const r = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Server error');
  return r.json();
}

export const serverAdapter = {
  async vote(flavor) { return toCounts(await post('/api/vote', { flavor })); },
  async results() { return toCounts(await (await fetch('/api/results')).json()); },
  async reset(pin) { return toCounts(await post('/api/reset', { pin })); },
  async exportRows() { return null; }, // server tự xuất CSV ở /api/export
};
