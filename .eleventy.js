const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const { DateTime } = require('luxon');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const pluginTailwind = require('eleventy-plugin-tailwindcss');
const icon = require('./_11ty/icon');

module.exports = (config) => {
    const env = process.env.ELEVENTY_ENV || 'dev';

    config.addPlugin(pluginRss);
    config.addPlugin(pluginSyntaxHighlight);
    config.addPlugin(pluginNavigation);
    config.addPlugin(pluginTailwind, {
        src: 'css/*',
    });

    config.setDataDeepMerge(true);

    config.addLayoutAlias('base', 'layouts/base.njk');
    config.addLayoutAlias('post', 'layouts/post.njk');
    config.addLayoutAlias('page', 'layouts/page.njk');
    config.addLayoutAlias('home', 'layouts/home.njk');
    config.addLayoutAlias('resume', 'layouts/resume.njk');

    config.addPassthroughCopy('img');
    // config.addPassthroughCopy('css');

    config.addFilter('readableDate', (dateObj) =>
        DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd LLL yyyy')
    );

    config.addFilter('htmlDateString', (dateObj) =>
        DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd')
    );

    config.addFilter('tags', (tags) => tags.filter((tag) => tag !== 'posts'));

    config.addFilter('head', (array, n) => (n < 0 ? array.slice(n) : array.slice(0, n)));

    config.addCollection('tagList', require('./_11ty/getTagList'));

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

    config.addShortcode('date', (date) => {
        if (!date) {
            return;
        }

        const month = date.toLocaleString('default', { month: 'short' });
        const day = `${date.getDate()}`.padStart(2, '0');
        const year = date.getFullYear();

        return `
        <div class="month">${month}</div>
        <div class="day">${day}</div>
        <div class="year">${year}</div>
        `;
    });

    config.addShortcode('icon', (path, classes) => {
        return icon(path, classes);
    });

    config.addShortcode(
        'youtube',
        (videoId) =>
            `<div class="video-wrapper"><iframe width="420" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`
    );

    const markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
    }).use(markdownItAnchor, {
        permalink: true,
        permalinkClass: 'direct-link',
        permalinkSymbol: '#',
    });
    config.setLibrary('md', markdownLibrary);

    return {
        markdownTemplateEngine: 'liquid',
        htmlTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',
        templateFormats: ['md', 'njk', 'html', 'liquid'],
    };
};
