const yaml = require('js-yaml');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const BASE_URL = 'https://marvatom.github.io/wedding-quiz/q/';
const HASH_SALT = 'wedding-quiz-t&m-2026';
const OUTPUT_DIR = path.join(__dirname, '../qr-codes');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'qr-sheet.html');

const data = yaml.load(
  fs.readFileSync(path.join(__dirname, '../src/_data/questions.yaml'), 'utf8')
);

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function renderHtml(cards) {
  const cardsHtml = cards.map((c) => `
    <div class="card">
      <img src="${c.dataUrl}" alt="QR code for question ${c.id}" width="220" height="220" />
      <div class="label">Q${c.id}</div>
      <div class="stem">${escapeHtml(c.stem)}</div>
      <div class="url">${c.url}</div>
    </div>`).join('\n');

  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8" />
<title>Wedding Quiz — QR Codes</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; }
  h1 { text-align: center; }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    page-break-inside: avoid;
  }
  .card img { width: 100%; height: auto; max-width: 220px; }
  .label { margin-top: 8px; font-size: 20px; font-weight: bold; }
  .stem { margin-top: 4px; font-size: 13px; color: #444; }
  .url { margin-top: 6px; font-size: 10px; color: #999; word-break: break-all; }
  @media print {
    body { padding: 0; }
    .url { display: none; }
  }
</style>
</head>
<body>
  <h1>Wedding Quiz — QR Codes</h1>
  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>
`;
}

async function main() {
  const cards = await Promise.all(
    data.questions.map(async (q) => {
      const hash = crypto.createHash('sha256').update(HASH_SALT + String(q.id)).digest('hex').slice(0, 8);
      const url = BASE_URL + hash + '/';
      const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 1 });
      return { id: q.id, stem: q.stem, url, dataUrl };
    })
  );

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, renderHtml(cards));
  console.log(`Wrote ${cards.length} QR codes to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
