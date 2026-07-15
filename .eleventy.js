const crypto = require('crypto');

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension('yaml,yml', (contents) => {
    const yaml = require('js-yaml');
    return yaml.load(contents);
  });

  eleventyConfig.addPassthroughCopy('src/assets');

  // Derive a stable 8-char hash from the question id with a fixed salt — used as the URL slug.
  // The salt prevents guests from enumerating all questions by guessing sequential ids.
  const HASH_SALT = 'wedding-quiz-t&m-2026';
  eleventyConfig.addFilter('questionHash', (id) =>
    crypto.createHash('sha256').update(HASH_SALT + String(id)).digest('hex').slice(0, 8)
  );

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
    pathPrefix: '/wedding-quiz/',
  };
};
