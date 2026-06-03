import fs from 'fs';

const FILE = 'src/main.js';
let content = fs.readFileSync(FILE, 'utf8');

const stateVars = [
    "gameScale", "rangeScale", "EARTH_RADIUS", "ORBIT_PATHS",
    "orbitLockStates", "orbitSlotCapacities", "orbitUpgradesCount", "shieldUpgradeLevel",
    "orbitRotations", "earthRotation", "planetName", "activeThemeKey", "lastInputTime",
    "waveActive", "spawnQueue", "spawnTimer", "lightningArcsToDraw", "shipAttackBeamsToDraw",
    "audioCtx", "isSfxEnabled", "isBgmEnabled", "sfxVolume", "bgmVolume", "bgmAudio",
    "activeBgmKey", "bgmUnlockListenerBound", "isScanlinesEnabled", "screenShakeIntensity",
    "isDevMode", "deferredInstallPrompt", "gameNoticeTimer", "tutorialHints",
    "planetTutorialTooltipShown", "starterTooltipsSuppressed", "firstDeploymentSlotHintShown",
    "masterCommandTourSeen", "masterCommandTourStep", "modeTransitionActive", "gameLoopStarted",
    "cosmicData", "research", "game", "bossMode", "resizeRaf", "pendingAppUpdate", "swRegistration"
];

// First, remove the `let xyz = ...;` declarations for these variables.
// They might be spread across multiple lines.
// We will just do a regex replace to remove lines that start with `let <varname> =`
for (const v of stateVars) {
    const declRegex = new RegExp(`^\\s*let\\s+${v}\\s*=.*?[;\\n]`, 'gm');
    content = content.replace(declRegex, '');
    
    // Some are declared like `let game = { ... };` spanning multiple lines.
    // For `game` and `bossMode`, let's just do a manual replace since they are multi-line.
}

// Manually remove `let game = { ... };` and `let bossMode = { ... };`
content = content.replace(/let game = \{[\s\S]*?\n        \};\n/, '');
content = content.replace(/let bossMode = \{[\s\S]*?\n        \};\n/, '');
content = content.replace(/let resizeRaf = null;\n/, '');
content = content.replace(/let pendingAppUpdate = false;\n/, '');
content = content.replace(/let swRegistration = null;\n/, '');


// Now, replace references with `state.<varname>`
// We use a negative lookbehind for '.' to avoid replacing `obj.game`
// We use a negative lookahead for ':' to avoid replacing object keys like `{ game: 1 }`
for (const v of stateVars) {
    const refRegex = new RegExp(`(?<!\\.)\\b${v}\\b(?!\\s*:)`, 'g');
    content = content.replace(refRegex, `state.${v}`);
}

// Add import at the top
if (!content.includes("import { state } from './state.js';")) {
    content = content.replace("import { ", "import { state } from './state.js';\nimport { ");
}

fs.writeFileSync(FILE, content);
console.log("Refactoring complete.");
