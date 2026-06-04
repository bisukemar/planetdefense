const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Catch errors
    page.on('pageerror', err => {
        console.error('PAGE ERROR:', err.message);
    });
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('CONSOLE ERROR:', msg.text());
        }
    });

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    // Trigger boss mode
    await page.evaluate(() => {
        window.startBossMode();
        setTimeout(() => {
            window.collectDrop({ type: 'weapon', enhancement: 'twin' });
        }, 1000);
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    await browser.close();
})();
