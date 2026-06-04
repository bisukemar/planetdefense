const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let frozen = false;

    page.on('pageerror', err => {
        console.error('PAGE ERROR:', err.message);
        process.exit(1);
    });
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('CONSOLE ERROR:', msg.text());
        } else {
            console.log('CONSOLE:', msg.text());
        }
    });

    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });

    // Inject test logic
    await page.evaluate(() => {
        window.startBossMode();
        
        setTimeout(() => {
            const weapons = ['twin', 'spread', 'heavy', 'rapid', 'homing', 'explosive', 'wave', 'side', 'ring', 'rear'];
            let wIndex = 0;
            
            const interval = setInterval(() => {
                if (wIndex >= weapons.length) {
                    clearInterval(interval);
                    console.log("TEST COMPLETE");
                    return;
                }
                const weapon = weapons[wIndex++];
                console.log("Testing weapon:", weapon);
                
                // Simulate picking up weapon
                const drop = { type: 'weapon', enhancement: weapon, x: 0, y: 0 };
                window.state.bossMode.drops.push(drop);
                
                // Let the player fire
                window.state.bossMode.player.dragging = true;
                
            }, 500);
        }, 1000);
    });

    // Wait and check if game loop is still running
    let lastFrame = await page.evaluate(() => window.state.bossMode.frame);
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        let newFrame = await page.evaluate(() => window.state.bossMode.frame);
        if (newFrame === lastFrame && newFrame > 0) {
            console.error('GAME FROZE at frame', newFrame);
            frozen = true;
            break;
        }
        lastFrame = newFrame;
    }

    if (!frozen) {
        console.log("SUCCESS: No freeze detected.");
    }
    
    await browser.close();
    process.exit(frozen ? 1 : 0);
})();
