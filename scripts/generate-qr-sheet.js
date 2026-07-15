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

const CARDS_PER_PAGE = 2;

function renderCell(c) {
  return `
    <div class="cell">
      <img src="${c.dataUrl}" alt="QR code for question ${c.id}" />
      <div class="label">${c.id}</div>
    </div>`;
}

function renderHtml(cards) {
  const pages = [];
  for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
    pages.push(cards.slice(i, i + CARDS_PER_PAGE));
  }

  const pagesHtml = pages.map((pageCards) => `
    <div class="page">
      ${pageCards.map(renderCell).join('\n')}
    </div>`).join('\n');

  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8" />
<title>Wedding Quiz — QR Codes</title>
<style>
  * { box-sizing: border-box; }
  @page { size: A4; margin: 0; }
  body { font-family: system-ui, sans-serif; margin: 0; }
  .page {
    width: 210mm;
    height: 297mm;
    display: flex;
    flex-direction: column;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }
  .cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-bottom: 1px dashed #999;
  }
  .cell:last-child { border-bottom: none; }
  .cell img { width: 60mm; height: 60mm; }
  .label { margin-top: 16px; font-size: 72px; font-weight: bold; }
</style>
</head>
<body>
  ${pagesHtml}
</body>
</html>
`;
}

async function main() {
  const cards = await Promise.all(
    data.questions.map(async (q) => {
      const hash = crypto.createHash('sha256').update(HASH_SALT + String(q.id)).digest('hex').slice(0, 8);
      const url = BASE_URL + hash + '/';
      const dataUrl = await QRCode.toDataURL(url, { width: 600, margin: 1 });
      return { id: q.id, dataUrl };
    })
  );

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, renderHtml(cards));
  console.log(`Wrote ${cards.length} QR code pages to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
