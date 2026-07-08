const yaml = require('js-yaml');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://marvatom.github.io/wedding-quiz/q/';
const data = yaml.load(
  fs.readFileSync(path.join(__dirname, '../src/_data/questions.yaml'), 'utf8')
);

data.questions.forEach((q, i) => {
  const hash = crypto.createHash('sha256').update(q.stem).digest('hex').slice(0, 8);
  console.log('Q' + (i + 1) + ' [' + hash + ']: ' + BASE_URL + hash + '/');
});
