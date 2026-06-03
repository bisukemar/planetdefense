import fs from 'fs';

let backup = fs.readFileSync('index.html.bak', 'utf8').split('\n');
let mainJs = fs.readFileSync('src/main.js', 'utf8').split('\n');

// Extract the missing lines from backup
const missingLines = backup.slice(2084, 2226);
let missingStr = missingLines.join('\n');

// Fix state and config references in the missing string
missingStr = missingStr.replace(/\bSATELLITE_CONFIGS\b/g, 'config.SATELLITE_CONFIGS');
missingStr = missingStr.replace(/\bSATELLITE_SPRITE_FILES\b/g, 'config.SATELLITE_SPRITE_FILES');
missingStr = missingStr.replace(/\bENEMY_SPRITE_FILES\b/g, 'config.ENEMY_SPRITE_FILES');
missingStr = missingStr.replace(/\bgameScale\b/g, 'state.gameScale');
missingStr = missingStr.replace(/\brangeScale\b/g, 'state.rangeScale');

// Insert it into mainJs.
// First, find line 235 (index 234)
// Wait, the broken part in mainJs is around line 240. Let's find "if (type === 'laser') {"
let insertIndex = mainJs.findIndex(line => line.includes("if (type === 'laser') {"));

if (insertIndex !== -1) {
    // We remove the empty lines before insertIndex that were left over
    let startRemove = insertIndex - 1;
    while (startRemove >= 0 && mainJs[startRemove].trim() === '') {
        startRemove--;
    }
    mainJs.splice(startRemove + 1, insertIndex - startRemove - 1);
    
    // Now insert
    const newInsertIndex = mainJs.findIndex(line => line.includes("if (type === 'laser') {"));
    mainJs.splice(newInsertIndex, 0, missingStr);
    
    fs.writeFileSync('src/main.js', mainJs.join('\n'));
    console.log("Fixed main.js syntax error.");
} else {
    console.log("Could not find insertion point.");
}
