const yaml = require('js-yaml');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://marvatom.github.io/wedding-quiz/q/';
const HASH_SALT = 'wedding-quiz-t&m-2026';
const data = yaml.load(
  fs.readFileSync(path.join(__dirname, '../src/_data/questions.yaml'), 'utf8')
);

data.questions.forEach((q) => {
  const hash = crypto.createHash('sha256').update(HASH_SALT + String(q.id)).digest('hex').slice(0, 8);
  console.log('Q' + q.id + ' [' + hash + ']: ' + BASE_URL + hash + '/');
});
