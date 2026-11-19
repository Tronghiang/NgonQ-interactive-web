// Cài đặt nhân viên: PIN → xem số liệu → xuất CSV / reset lượt
import { $, $$ } from '../core/dom.js';
import { emit } from '../core/events.js';
import { APP_CONFIG } from '../config/app.config.js';
import { flavorById } from '../config/flavors.js';
import { TallyRows } from '../components/tally-table.js';
import { DATA_MODE, getResults, resetRound, exportRows } from '../services/data/index.js';
import { toCsv, downloadFile, today } from '../utils/csv.js';

const STEPS = ['pinStep', 'adminStep', 'confirmStep'];

export function initSettings({ onOpen, onClose }) {
  const sheet = $('#settings');
  const pin = $('#pinInput');
  const step = (id) => STEPS.forEach((s) => { $('#' + s).hidden = s !== id; });

  function open() {
    onOpen?.();
    sheet.hidden = false;
    step('pinStep');
    pin.value = '';
    $('#pinErr').textContent = '';
    setTimeout(() => pin.focus(), 50);
  }
  function close() { sheet.hidden = true; onClose?.(); }

  function checkPin() {
    if (pin.value !== APP_CONFIG.adminPin) { $('#pinErr').textContent = 'Wrong PIN'; return; }
    openAdmin();
  }

  async function openAdmin() {
    $('#tally').innerHTML = TallyRows(await getResults());
    $('#modeNote').textContent = DATA_MODE === 'browser'
      ? 'Votes are stored on this device (browser).'
      : `Votes are stored in: ${DATA_MODE}`;
    step('adminStep');
  }

  async function exportCsv() {
    const rows = await exportRows();
    if (rows === null) { location.href = '/api/export'; return; }
    const csv = toCsv(['No', 'Flavor ID', 'Flavor', 'Time'], rows.map((r, i) => [
      i + 1, r.flavor_id, flavorById(r.flavor_id)?.name ?? r.flavor_id,
      new Date(r.created_at).toLocaleString('en-GB'),
    ]));
    downloadFile(csv, `ngonq-votes-${today()}.csv`);
  }

  $$('[data-open-settings]').forEach((b) => b.addEventListener('click', open));
  $$('[data-close-settings]').forEach((b) => b.addEventListener('click', close));
  sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });

  $('#pinBtn').addEventListener('click', checkPin);
  pin.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkPin(); });
  $('#exportBtn').addEventListener('click', exportCsv);
  $('#resetBtn').addEventListener('click', () => step('confirmStep'));
  $('#cancelReset').addEventListener('click', () => step('adminStep'));
  $('#doReset').addEventListener('click', async () => {
    await resetRound(pin.value);
    emit('round:reset');
    openAdmin();
  });
}
