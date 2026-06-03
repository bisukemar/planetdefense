import fs from 'fs';

function extractClass(content, className) {
    const classStartStr = `class ${className} {`;
    const startIndex = content.indexOf(classStartStr);
    if (startIndex === -1) return null;

    let braceCount = 0;
    let i = startIndex + classStartStr.length - 1; // points to the `{`
    if (content[i] !== '{') throw new Error("Expected {");

    while (i < content.length) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;

        if (braceCount === 0) {
            const endIndex = i + 1;
            const classCode = content.substring(startIndex, endIndex);
            return { code: classCode, start: startIndex, end: endIndex };
        }
        i++;
    }
    return null;
}

function process() {
    let mainJs = fs.readFileSync('src/main.js', 'utf8');
    let configJs = fs.readFileSync('src/config.js', 'utf8');
    const classesToExtract = ['Enemy', 'Satellite', 'Projectile', 'Particle'];

    if (!fs.existsSync('src/entities')) {
        fs.mkdirSync('src/entities');
    }

    // 1. Move configs to config.js
    // We will find the block starting with "const ENEMY_PROFILES =" and ending right before "const BOSS_FIRST_WAVE ="
    // Actually, let's just grab the block manually since we know the lines
    // Wait, regex is easier for these variables since they are const arrays
    const varsToMove = [
        'ENEMY_PROFILES', 'BOSS_SHIPS', 'BOSS_WEAPON_ENHANCEMENTS', 'BOSS_FIRST_WAVE',
        'BOSS_ROUND_INTERVAL', 'DIRECTIVE_RARITY_COLORS', 'DIRECTIVE_RARITY_WEIGHTS',
        'COMMAND_DIRECTIVES', 'COMMAND_DIRECTIVE_TIERS'
    ];

    for (const v of varsToMove) {
        const regex = new RegExp(`const\\s+${v}\\s*=\\s*(\\[[\\s\\S]*?\\]|\\{[\\s\\S]*?\\}|\\d+);`, 'm');
        const match = mainJs.match(regex);
        if (match) {
            configJs += `\nexport ${match[0]}\n`;
            mainJs = mainJs.replace(match[0], '');
        }
    }
    fs.writeFileSync('src/config.js', configJs);

    // 2. Extract classes
    const imports = [];
    for (const cls of classesToExtract) {
        const extracted = extractClass(mainJs, cls);
        if (extracted) {
            console.log(`Extracted ${cls}`);
            
            let fileContent = `import { state } from '../state.js';\nimport * as config from '../config.js';\n\n`;
            
            // Fix references to use config.
            let code = extracted.code;
            for (const v of varsToMove) {
                const refRegex = new RegExp(`(?<!\\.)\\b${v}\\b`, 'g');
                code = code.replace(refRegex, `config.${v}`);
            }
            // Also SATELLITE_CONFIGS, ENEMY_PROFILES, BASE_ORBIT_PATHS, which were moved earlier
            const oldConfigs = ['SATELLITE_CONFIGS', 'BASE_ORBIT_PATHS', 'PLANET_TEXTURE_FILES', 'SATELLITE_SPRITE_FILES', 'ENEMY_SPRITE_FILES', 'ENEMY_SPRITE_SCALE', 'BGM_TRACKS', 'PRELOAD_ASSET_URLS', 'APP_VERSION'];
            for (const v of oldConfigs) {
                const refRegex = new RegExp(`(?<!\\.)\\b${v}\\b`, 'g');
                code = code.replace(refRegex, `config.${v}`);
            }
            
            // Fix references to globals in main.js
            code = code.replace(/(?<!\.)\bcanvas\b/g, 'state.canvas');
            code = code.replace(/(?<!\.)\bctx\b/g, 'state.ctx');
            code = code.replace(/(?<!\.)\bgetDirectiveEffectValue\b/g, 'state.getDirectiveEffectValue');
            code = code.replace(/(?<!\.)\bplaySynthSound\b/g, 'state.playSynthSound');
            code = code.replace(/(?<!\.)\bshakeScreen\b/g, 'state.shakeScreen');
            code = code.replace(/(?<!\.)\bcreateExplosion\b/g, 'state.createExplosion');
            code = code.replace(/(?<!\.)\bspawnReward\b/g, 'state.spawnReward');
            code = code.replace(/(?<!\.)\bupdateStatsUI\b/g, 'state.updateStatsUI');
            
            fileContent += `export ` + code + `\n`;
            fs.writeFileSync(`src/entities/${cls}.js`, fileContent);
            
            mainJs = mainJs.substring(0, extracted.start) + mainJs.substring(extracted.end);
            imports.push(`import { ${cls} } from './entities/${cls}.js';`);
        }
    }

    // Replace config references in main.js as well!
    for (const v of varsToMove) {
        const refRegex = new RegExp(`(?<!\\.)\\b${v}\\b(?!\\s*:)`, 'g');
        mainJs = mainJs.replace(refRegex, `config.${v}`);
    }

    // Add imports to the top of main.js
    const firstImportIndex = mainJs.indexOf('import');
    if (firstImportIndex !== -1 && imports.length > 0) {
        mainJs = mainJs.substring(0, firstImportIndex) + imports.join('\n') + '\n' + mainJs.substring(firstImportIndex);
    }

    fs.writeFileSync('src/main.js', mainJs);
}

process();
