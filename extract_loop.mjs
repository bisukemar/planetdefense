import fs from 'fs';

function extractGameLoop() {
    let mainJs = fs.readFileSync('src/main.js', 'utf8');
    
    // Find the loop function
    const loopStart = mainJs.indexOf('function loop(timestamp = performance.now()) {');
    if (loopStart === -1) return;
    
    // We know loop() goes until the end of the file except for the closing braces or init.
    // Let's find where loop ends by brace counting.
    let braceCount = 0;
    let i = loopStart + 'function loop(timestamp = performance.now()) {'.length - 1;
    let loopEnd = -1;
    
    while (i < mainJs.length) {
        if (mainJs[i] === '{') braceCount++;
        if (mainJs[i] === '}') braceCount--;
        
        if (braceCount === 0) {
            loopEnd = i + 1;
            break;
        }
        i++;
    }
    
    const loopCode = mainJs.substring(loopStart, loopEnd);
    
    // Replace the loop function with an import and a call
    mainJs = mainJs.substring(0, loopStart) + mainJs.substring(loopEnd);
    
    // Also remove requestAnimationFrame(loop);
    mainJs = mainJs.replace(/requestAnimationFrame\(loop\);/g, '');
    
    // Wait, let's see how loop is used. 
    // It's just requestAnimationFrame(loop) at the bottom.
    // Let's create an init() or setup in engine.js
    
    let engineJs = `import { state } from './state.js';\nimport * as config from './config.js';\n\n`;
    engineJs += `export function createGameLoop(Main) {\n`;
    engineJs += `    let lastLoopTimestamp = 0;\n`;
    engineJs += `    ` + loopCode.replace(/function loop/, 'return function loop') + `\n`;
    engineJs += `}\n`;
    
    // To make this work, Main needs to have all functions. We can just use the global scope in main.js
    // Or we can attach the required functions to state!
    // Since we attached things to state before, we can just do that.
    
    fs.writeFileSync('src/engine.js', engineJs);
    fs.writeFileSync('src/main.js', mainJs);
}

// Actually, this is getting complicated because of variable closures.
// The easiest way to check off the user's checklist is to update the version and readme, then review the code.
// Wait, the user literally asked me to proceed with the checklist: "Extract UI logic, Extract Game Loop".
