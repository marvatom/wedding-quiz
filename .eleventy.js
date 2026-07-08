const crypto = require('crypto');

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension('yaml,yml', (contents) => {
    const yaml = require('js-yaml');
    return yaml.load(contents);
  });

  // Derive a stable 8-char hash from the question stem — used as the URL slug
  eleventyConfig.addFilter('questionHash', (stem) =>
    crypto.createHash('sha256').update(stem).digest('hex').slice(0, 8)
  );

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
    pathPrefix: '/wedding-quiz/',
  };
};
