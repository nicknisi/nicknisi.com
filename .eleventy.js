const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginNavigation = require('@11ty/eleventy-navigation');
const { DateTime } = require('luxon');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

module.exports = (config) => {
    config.addPlugin(pluginRss);
    config.addPlugin(pluginSyntaxHighlight);
    config.addPlugin(pluginNavigation);

    config.setDataDeepMerge(true);

    config.addLayoutAlias('base', 'layouts/base.njk');
    config.addLayoutAlias('post', 'layouts/post.njk');
    config.addLayoutAlias('page', 'layouts/page.njk');
    config.addLayoutAlias('home', 'layouts/home.njk');
    config.addLayoutAlias('resume', 'layouts/resume.njk');

    config.addPassthroughCopy('img');
    config.addPassthroughCopy('css');

    config.addFilter('readableDate', (dateObj) =>
        DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('dd LLL yyyy')
    );

    config.addFilter('htmlDateString', (dateObj) =>
        DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd')
    );

    config.addFilter('tags', (tags) => tags.filter((tag) => tag !== 'posts'));

    config.addFilter('head', (array, n) => (n < 0 ? array.slice(n) : array.slice(0, n)));

    config.addCollection('tagList', require('./_11ty/getTagList'));

    const markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true
    }).use(markdownItAnchor, {
        permalink: true,
        permalinkClass: 'direct-link',
        permalinkSymbol: '#'
    });
    config.setLibrary('md', markdownLibrary);

    return {
        markdownTemplateEngine: 'liquid',
        htmlTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',
        templateFormats: ['md', 'njk', 'html', 'liquid']
    };
};
