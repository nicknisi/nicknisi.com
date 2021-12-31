const chromium = require('chrome-aws-lambda');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });

    const page = await browser.newPage();

    const html = fs.readFileSync(path.resolve(__dirname, './template.html')).toString();
    const posts = require('./posts.json');

    await page.setContent(html, {
        waitUntil: ['networkidle0'],
    });

    await page.evaluateHandle('document.fonts.ready');

    await page.setViewport({
        width: 600,
        height: 315,
        deviceScaleFactor: 2,
    });

    const dir = path.resolve(__dirname, '../_site/img/social');

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    for (const post of posts) {
        await page.evaluate((post) => {
            const title = document.querySelector('h1');
            title.innerHTML = post.title;
        }, post);

        console.log(`Image: ${post.slug}.png`);

        await page.screenshot({
            path: `${dir}/${post.slug}.png`,
            type: 'png',
            clip: { x: 0, y: 0, width: 600, height: 315 },
        });
    }

    await browser.close();
})();
