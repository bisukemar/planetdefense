import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    try {
        await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 10000 });
        
        // Wait 1 second for the bootloader to fade out
        await new Promise(r => setTimeout(r, 2000));
        
        const info = await page.evaluate(() => {
            const loader = document.getElementById('boot-loader');
            const progress = document.getElementById('boot-loader-count');
            return {
                opacity: window.getComputedStyle(loader).opacity,
                progressText: progress ? progress.innerText : 'null'
            };
        });
        
        console.log('Loader status after 2s:', info);
    } catch (e) {
        console.log('Navigation error:', e.message);
    }
    
    await browser.close();
})();
