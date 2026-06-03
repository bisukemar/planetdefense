import fs from 'fs';

let configJs = fs.readFileSync('src/config.js', 'utf8').split('\n');

// Find the line with the end of COMMAND_DIRECTIVES:
const endLine = configJs.findIndex(line => line.includes('].map(directive => ({ ...directive, color: DIRECTIVE_RARITY_COLORS[directive.rarity] || '));

if (endLine !== -1) {
    // Keep everything up to the end line
    configJs = configJs.slice(0, endLine + 1);
    
    // Add COMMAND_DIRECTIVE_TIERS
    configJs.push('');
    configJs.push('export const COMMAND_DIRECTIVE_TIERS = {');
    configJs.push("    'S': { name: 'S-Tier', color: '#facc15' },");
    configJs.push("    'A': { name: 'A-Tier', color: '#38bdf8' },");
    configJs.push("    'B': { name: 'B-Tier', color: '#34d399' }");
    configJs.push('};');
    
    fs.writeFileSync('src/config.js', configJs.join('\n'));
    console.log("Fixed config.js");
} else {
    console.log("Could not find end line in config.js");
}
