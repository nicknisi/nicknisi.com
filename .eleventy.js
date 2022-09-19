const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const htmlmin = require('html-minifier');
const { DateTime } = require('luxon');
const icon = require('./_11ty/icon');
const svg = require('./_11ty/svg');

const now = String(Date.now());

module.exports = (config) => {
  const env = process.env.ELEVENTY_ENV || 'dev';

  config.addWatchTarget('./styles/tailwind.config.js');
  config.addWatchTarget('./styles/tailwind.css');

  config.addPassthroughCopy('./_tmp/styles.css', './style.css');
  config.addPassthroughCopy('img');
  config.addPassthroughCopy('css');

  config.addPlugin(pluginRss);
  config.addPlugin(pluginSyntaxHighlight);
  config.addPlugin(pluginNavigation);

  config.addLayoutAlias('base', 'layouts/base.njk');
  config.addLayoutAlias('post', 'layouts/post.njk');
  config.addLayoutAlias('page', 'layouts/page.njk');
  config.addLayoutAlias('home', 'layouts/home.njk');
  config.addLayoutAlias('resume', 'layouts/resume.njk');

  config.addTransform('htmlmin', (content, outputPath) => {
    if (process.env.ELEVENTY_PRODUCTION && outputPath && outputPath.endsWith('.html')) {
      const minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });

      return minified;
    }
    return content;
  });

  config.addFilter('readableDate', (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd LLL yyyy')
  );

  config.addFilter('htmlDateString', (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd')
  );

  config.addFilter('head', (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }

    return n < 0 ? array.slice(n) : array.slice(0, n);
  });

  const filterTagList = (tags = []) =>
    tags.filter((tag) => ['all', 'nav', 'post', 'posts'].indexOf(tag) === -1);

  config.addFilter('filterTagList', filterTagList);
  config.addFilter('tags', (tags = []) => tags.filter((tag) => tag !== 'posts'));
  config.addFilter('uppercase', (value) => value.toUpperCase());
  config.addCollection('tagList', (collection) => {
    const tagSet = new Set();
    collection.getAll().forEach((item) => {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  config.addCollection('posts', (collection) => {
    const posts = collection.getFilteredByTag('posts').map((post, i, posts) => {
      post.data.prevPost = posts[i - 1];
      post.data.nextPost = posts[i + 1];
      return post;
    });

    // filter out drafts posts in a production build
    if (env === 'prod') {
      return posts.filter((post) => !post.data.draft);
    }

    return posts;
  });

  config.addShortcode('version', () => now);

  config.addShortcode('date', (date) => {
    if (!date) {
      return;
    }

    const luxonDate = DateTime.fromJSDate(date, { zone: 'utc' });

    const month = luxonDate.toLocaleString({ month: 'short' });
    const { day, year } = luxonDate;

    return `
        <div class="month">${month}</div>
        <div class="day">${`${day}`.padStart(2, '0')}</div>
        <div class="year">${year}</div>
        `;
  });

  config.addShortcode('icon', (path, classes) => {
    return icon(path, classes);
  });

  config.addShortcode('svg', (path, classes, tag) => svg(path, classes, tag));

  config.addShortcode(
    'youtube',
    (videoId) =>
      `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`
  );

  const markdownLibrary = markdownIt({
    html: true,
    linkify: true,
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'after',
      class: 'direct-link',
      symbol: '#',
    }),
    level: [1, 2, 3, 4],
    slugify: config.getFilter('slugify'),
  });

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    pathPrefix: '/',
    dir: {
      input: '.',
      include: '_includes',
      data: '_data',
      output: '_site',
    },
  };
};
