export const APP_VERSION = 'Alpha 0.9.78.155';
export const TARGET_FRAME_MS = 1000 / 60;

export const PATCH_NOTES = [
    { version: 'Alpha 0.9.78.155', notes: ['Overhauled the Boss Intercept ship weapon system into a persistent purchase, upgrade, and equip progression system.', 'Added Ship Tech tab in Research Lab with bespoke skill trees for firing rate, drone damage, shields, and dodge utility.', 'Added Ship Upgrade & Loadout accordion in Master Command Center to buy and equip primary/secondary weapons.', 'Replaced combat weapon drops with four temporary combat buffs (Fire Rate, Double Damage, Proton Shield, Item Magnet).'] },
    { version: 'Alpha 0.9.77.154', notes: ['Redesigned the desktop HUD into a unified, space-efficient command dashboard.', 'Moved resource counters (Credits and Score) to the top header for better tactical awareness.', 'Compact side-by-side health and shield integrity status bars.', 'Optimized vertical play area clearance and notice alert positioning.'] },
    { version: 'Alpha 0.9.76.153', notes: ['Under-the-hood performance optimizations to wave spawning routines.', 'Optimized the cache reload system to resolve intermittent service worker loops.', 'Addressed minor UI layout scaling issues on various viewport sizes.'] },
    { version: 'Alpha 0.9.75.152', notes: ['Added Tier Surge system: every 5 waves all enemies receive a stacking stat boost (+12% HP, +10% damage, +4% speed per tier). Tier 1 activates at Wave 5, Tier 2 at Wave 10, etc.', 'Added in-game Tier Surge notice that appears at the start of each milestone wave, color-coded by tier severity.', 'Gold rewards scale proportionally with tiers (+10% per tier) to keep progression fair.'] },
    { version: 'Alpha 0.9.74.151', notes: ['Introduced the Enemy Affix System: Every 10 waves, a milestone wave triggers, applying a wave-wide universal affix to all spawned enemies (e.g. Shielded, Reactive, Glacial, Volatile).', 'Added 11 unique enemy affixes with bespoke behavioral modifiers, stat scaling, and custom visual overlays/VFX.', 'Added the Affixes catalog to the Space Encyclopedia to provide details on each wave modifier.'] },
    { version: 'Alpha 0.9.73.150', notes: ['Enhanced Boss Intercept Mode mechanics: Pre-boss Gatekeepers now drift horizontally at the boss orbital altitude instead of flying offscreen.', 'Added a dramatic cinematic entrance sequence and kill explosions for boss encounters.', 'Increased weapon drop size and pickup collision radius for easier collection.', 'Removed the bottom movement restriction in Boss Mode, allowing full use of the screen.'] },
    { version: 'Alpha 0.9.73.149', notes: ['Fixed a critical freeze that occurred when the Boss Gatekeeper spawned while the player had a weapon upgrade.', 'Improved "Check for Update" button to force an immediate reload upon finding an update.'] },
    { version: 'Alpha 0.9.73.148', notes: ['Added "Check for Update" button in the Install panel.'] },
    { version: 'Alpha 0.9.73.144', notes: ['Fixed critical ES Module migration bugs that prevented variables from being accessed across files.', 'Fixed an issue where satellites failed to render and fire due to missing utility function imports.', 'Fixed a crash during startup caused by the unassigned canvas state object.'] },
    { version: 'Alpha 0.9.72.139', notes: ['Massive architectural refactoring: Migrated the project to Vite for ES Module support.', 'Extracted game entities (Enemy, Satellite, Projectile, Particle) into standalone modules.', 'Centralized mutable global variables into a state module to improve maintainability and performance.'] },
    { version: 'Alpha 0.9.71.138', notes: ['Aligned the Mini-Boss warning banner vertically with the other game notices.'] },
    { version: 'Alpha 0.9.70.137', notes: ['Aligned the Mini-Boss warning banner vertically with the other game notices.'] },
    { version: 'Alpha 0.9.69.136', notes: ['Fixed warning banner centering issue caused by animation transform overrides.', 'Removed the ghosting animation (debris persistence) of killed enemies.'] },
    { version: 'Alpha 0.9.68.135', notes: ['Restored the missing Research Lab UI panel that was accidentally removed in a previous patch.'] },
    { version: 'Alpha 0.9.67.134', notes: ['Tactical Abilities (Orbital Strike, EMP, Shield Surge) are now unlocked individually in Master Command.', 'Fixed a bug where Research Lab buttons were unresponsive to touch input.'] },
    { version: 'Alpha 0.9.66.133', notes: ['Tactical Abilities are now hidden at the start of a run and must be unlocked through the Master Command Center.'] },
    { version: 'Alpha 0.9.65.132', notes: ['Fixed a silent object-null crash that prevented the Research Lab button from opening when loading older save files.', 'Fixed an undeclared speed variable that caused the game to completely freeze when deploying Tactical Abilities or generating debris.'] },
    { version: 'Alpha 0.9.64.131', notes: ['Fixed Research Lab accessibility by correcting its parent hierarchy in the title screen.', 'Fixed an undefined variable exception that caused the game to freeze when deploying Tactical Abilities like EMP.'] },
    { version: 'Alpha 0.9.63.130', notes: ['Added Research Lab for persistent meta-progression using Cosmic Data.', 'Added Active Tactical Abilities (Orbital Laser, EMP, Surge) during defense waves.', 'Added Deep Space Anomalies (Rogue Comets, Smuggler Ships) to mid-wave events.', 'Added satellite damage states (smoking/sparking), destroyed debris persistence, and warp tunnel visual effects.'] },
    { version: 'Alpha 0.9.62.129', notes: ['Added a continuous, pulsing red visual warning overlay when the planet core or player fighter drops below 30% health.'] },
    { version: 'Alpha 0.9.61.128', notes: ['Adjusted planet shield visual thickness based on its current health. The shield is now invisible when depleted.'] },
    { version: 'Alpha 0.9.60.127', notes: ['Added a blue vignette overlay when the planet shield takes damage.'] },
    { version: 'Alpha 0.9.59.126', notes: ['Added a red visual vignette overlay to indicate when the planet core or the player fighter takes damage.'] },
    { version: 'Alpha 0.9.58.125', notes: ['Added an "Explosion/Screen Shake Intensity" slider to the Visuals & Gameplay settings menu to allow players to customize or disable screen shake.'] },
    { version: 'Alpha 0.9.57.124', notes: ['Added a dynamic screen shake effect when the planet core or shields take damage to drastically improve impact feel.'] },
    { version: 'Alpha 0.9.56.123', notes: ['Added a pulsing outline to the Proton Shield button during Boss Intercepts to clearly indicate when it is available for use.'] },
    { version: 'Alpha 0.9.55.122', notes: ['Added a visual shatter effect and audio cue when the Proton Shield expires.'] },
    { version: 'Alpha 0.9.54.121', notes: ['Replaced Boss Intercept Dash with Proton Shield (one-time 3s invulnerability).', 'Fixed hitbox misalignment causing unfair damage during boss encounters by perfectly centering the collision point.'] },
    { version: 'Alpha 0.9.53.120', notes: ['Redesigned Boss Intercept Dash to use velocity vectors instead of pointer interpolation, fixing mouse and drag control issues.', 'Added Double-Tap and Spacebar/Shift keyboard shortcuts to trigger Dash quickly.'] },
    { version: 'Alpha 0.9.52.119', notes: ['Fixed an issue where the Mini-Boss warning banner was uncentered and hidden on mobile devices.'] },
    { version: 'Alpha 0.9.51.118', notes: ['Enhanced the active visual state of the Fast-Forward toggle to include a glowing background and pulsing icon.'] },
    { version: 'Alpha 0.9.50.117', notes: ['Shrank the player fighter collision hitbox during Boss Intercepts to a small central core, allowing for fair bullet-hell dodging.', 'Added a visual glowing core to the player ship to clearly telegraph the vulnerable hitbox.'] },
    { version: 'Alpha 0.9.49.116', notes: ['Restored missing collision detection function that caused the game to freeze during defense waves.'] },
    { version: 'Alpha 0.9.48.115', notes: ['Fixed a major performance freeze when using the Fast-Forward button by switching to a time-delta multiplier instead of double-iteration looping.'] },
    { version: 'Alpha 0.9.47.114', notes: ['Added Player Phase Dash active ability to Boss Intercepts.', 'Introduced Environmental Hazards (Solar Flares, Ion Storms, Debris Fields) that sporadically appear during defense waves.', 'Added Fast-Forward (2x speed) toggle for defense waves.', 'Refactored core game loop to cleanly separate physics updates from rendering.'] },
    { version: 'Alpha 0.9.46.113', notes: ['Lowered the attack range of the Void Harvester Mini-Boss.'] },
    { version: 'Alpha 0.9.45.112', notes: ['Added a heavily armored Vanguard Gatekeeper that must be defeated before the main Boss appears.', 'Enhanced Boss Intercept minion swooping patterns with varied speeds and amplitudes.'] },
    { version: 'Alpha 0.9.44.111', notes: ['Optimized warp drive rendering for better mobile performance.', 'Added dynamic bounding to boss intercept squads to prevent enemies from spawning or sweeping off-screen on narrow devices.'] },
    { version: 'Alpha 0.9.43.110', notes: ['Added Warp Drive visual effect to the background during Boss Intercepts.', 'Enemy ships during the Boss Intercept phase now spawn in varied squad formations and use sweeping lateral movements.'] },
    { version: 'Alpha 0.9.42.109', notes: ['Replaced modulo-based boss collision with an invulnerability frame system, ensuring direct hits always damage the player immediately.'] },
    { version: 'Alpha 0.9.41.108', notes: ['Buffed Boss HP and added multi-layered boss health bar.', 'Added Boss Dive Attack behavior with a telegraph path indicator.', 'Hostile ships in boss waves now periodically fire downwards.'] },
    { version: 'Alpha 0.9.40.107', notes: ['Added Space Encyclopedia access to the Pause Menu.', 'Removed Dev Mode from the Pause Menu settings.'] },
    { version: 'Alpha 0.9.39.106', notes: ['Changed cost and salvage displays to show base values with modifiers appended explicitly.'] },
    { version: 'Alpha 0.9.38.105', notes: ['Fixed legibility of cost penalty and bonus text on dynamic button backgrounds.'] },
    { version: 'Alpha 0.9.37.104', notes: ['Added middle (+25%) and outer (+50%) orbit penalties to Satellite Upgrade Costs.'] },
    { version: 'Alpha 0.9.36.103', notes: ['Added explicit (+x) and (-x) indicators to the repair, upgrade, and salvage buttons to clearly show the impact of orbit placement modifiers and Command Directives.', 'Increased repair costs and reduced salvage yields for outer orbits.'] },
    { version: 'Alpha 0.9.35.102', notes: ['Completely separated and fixed the standalone Pause Menu Settings panel to resolve conflicts with the title screen.'] },
    { version: 'Alpha 0.9.32.99', notes: ['Fixed z-index layering bug and removed duplicated settings panel preventing it from appearing over the Pause Menu.', 'Tighter button spacing and padding on the title screen menu.'] },
    { version: 'Alpha 0.9.31.98', notes: ['Fixed an issue where the redesigned Pause Menu HTML structure was not properly applied.'] },
    { version: 'Alpha 0.9.30.97', notes: ['Redesigned Pause Menu: Removed Audio System toggle and added a direct Settings button.', 'Rearranged and visually enhanced Pause Menu buttons.'] },
    { version: 'Alpha 0.9.29.96', notes: ['Improved UI spacing and size for satellite inspector Previous/Next navigation buttons.'] },
    { version: 'Alpha 0.9.28.95', notes: ['Revised wave start sound effect to a "call to action" alert and the wave clear sound to a victorious arpeggio.'] },
    { version: 'Alpha 0.9.27.94', notes: ['Added custom sound effects for deploying satellites, wave start, wave clear, warnings, and destroying enemies.', 'Replaced settings browser confirmation prompt with an in-game modal popup.'] },
    { version: 'Alpha 0.9.26.93', notes: ['Added Previous/Next navigation buttons to the satellite inspector panel to easily cycle through deployed satellites within the same orbit.'] },
    { version: 'Alpha 0.9.25.92', notes: ['Nerfed the Void Harvester Mini-Boss (reduced health, damage, and fire rate).'] },
    { version: 'Alpha 0.9.24.91', notes: ['Mini-Bosses now prioritize targeting satellites with their special attacks before striking the Earth.', 'Escort ships now spawn strictly in front and at the sides of the Mini-Boss.'] },
    { version: 'Alpha 0.9.23.90', notes: ['Fixed Mini-Boss wave warning banner animation glitch.', 'Escorts now spawn directly beside the Mini-Boss and maintain a fixed formation without revolving.'] },
    { version: 'Alpha 0.9.22.89', notes: ['Extended the duration of the Mini-Boss warning banner to ensure visibility.', 'Mini-Boss escorts now actively surround and follow the Mini-Boss.', 'Mini-Bosses now attack satellites and the planet from range rather than crashing.', 'Added a periodic heavy special attack for Mini-Bosses.'] },
    { version: 'Alpha 0.9.21.88', notes: ['Added Mini-Boss enemy classification. Mini-Bosses now reliably spawn with escort formations on the waves immediately preceding a Boss Round.'] },
    { version: 'Alpha 0.9.20.87', notes: ['Changed Master Command\'s orbit expansion and unlock button text to clearly state "DISABLED WHILE UNDER ATTACK" during active defense waves.'] },
    { version: 'Alpha 0.9.19.86', notes: ['Added defensive weaknesses to satellites: Turrets/Missiles take extra damage from Rock collisions, Plasma/Railguns take extra damage from Ship attacks.'] },
    { version: 'Alpha 0.9.18.85', notes: ['Disabled building, salvaging, and upgrading satellites and orbits during active waves. Added notification when attempted.'] },
    { version: 'Alpha 0.9.17.84', notes: ['Adjusted satellite costs: Reduced Plasma Obliterator cost (220 -> 180) and increased Laser Sentry cost (200 -> 260) to better reflect their tactical value.'] },
    { version: 'Alpha 0.9.16.83', notes: ['Implemented Threat Budget system for balanced enemy generation.', 'Added Specialized Thematic Waves and Veteran enemy variants for exponential difficulty scaling.', 'Added cluster spawn formations and disabled deployment/building during active waves.'] },
    { version: 'Alpha 0.9.15.82', notes: ['Added "Eject Weapon" button during boss fights to let players discard a weapon enhancement and return to the basic attack.'] },
    { version: 'Alpha 0.9.14.81', notes: ['Gathered repair kits now persist between successful boss rounds but are lost upon defeat.', 'Increased the chance of enemy ships dropping weapon enhancements to 25%.', 'Ensured the boss action panel correctly hides when returning to planetary defense.'] },
    { version: 'Alpha 0.9.13.80', notes: ['Boss encounters now persist upon defeat; players must clear the same boss before advancing to the next.', 'Added 10 distinct weapon enhancements dropped from enemy ships during Boss Intercept.', 'Added consumable Repair Kits dropped from rocks during Boss Intercept.'] },
    { version: 'Alpha 0.9.12.79', notes: ['Boss Time Attack mode now spawns the boss immediately, bypassing the minion wave phase.'] },
    { version: 'Alpha 0.9.11.78', notes: ['Boss Time Attack mode now displays the boss special attack prominently and returns to the menu upon completion.'] },
    { version: 'Alpha 0.9.10.77', notes: ['Added Boss Time Attack mode to the main menu for testing specific boss encounters.'] },
    { version: 'Alpha 0.9.9.76', notes: ['Added distinct visual flash effects and particle bursts to telegraph when bosses use their special attacks.'] },
    { version: 'Alpha 0.9.8.75', notes: ['Revised boss battles to feature unique projectile patterns and periodic special attacks tailored to each boss ship.'] },
    { version: 'Alpha 0.9.7.74', notes: ['Replaced generic boss sprite with unique individual sprite files for each boss ship.'] },
    { version: 'Alpha 0.9.6.73', notes: ['Changed update behavior to only refresh the game on launch or in the main menu to prevent mid-game interruptions.'] },
    { version: 'Alpha 0.9.5.72', notes: ['Rebalanced satellites with unique structural specialties and vulnerabilities.', 'Updated Space Encyclopedia to detail satellite strengths and weaknesses.', 'Speed bonus stat improvements now display in green with negative values.', 'Added dynamic empty slot warning overlay to the deployment drawer.'] },
    { version: 'Alpha 0.9.4.71', notes: ['Removed the seconds suffix from satellite speed stats so it is easier to read.'] },
    { version: 'Alpha 0.9.3.70', notes: ['Satellite stat panels now show upgraded base stats plus separate directive bonus deltas.'] },
    { version: 'Alpha 0.9.2.69', notes: ['Locked the main game loop to a normalized 60 FPS cadence so gameplay speed stays consistent on high-refresh displays.'] },
    { version: 'Alpha 0.9.1.68', notes: ['Changed versioning to Alpha Major.Minor.Patch.Build.', 'Command Directive reward cards now show only the next level number.', 'Added README patch history and expanded in-game patch notes.'] },
    { version: 'Alpha 0.9.0.67', notes: ['Added the Patch Notes menu.', 'Consolidated satellite upgrades into one level capped at 10.', 'Added satellite level badges and active stat bonus display.', 'Moved the first deploy guide above the planet.'] },
    { version: 'Alpha 0.8.4.66', notes: ['Smoothed the wave event outro animation.'] },
    { version: 'Alpha 0.8.4.65', notes: ['Revised wave start and wave end effects for better readability.'] },
    { version: 'Alpha 0.8.3.64', notes: ['Removed duplicate desktop wave button.', 'Moved the visible credit focus to the bottom HUD.', 'Added stronger wave state feedback.'] },
    { version: 'Alpha 0.8.2.63', notes: ['Reduced flicker risk in layered canvas effects.', 'Extended boss defeat explosions before player fly-out.', 'Added energetic card selection entrance animation.'] },
    { version: 'Alpha 0.8.1.62', notes: ['Enhanced boss destruction sequence.', 'Added post-boss story briefing before directive selection.'] },
    { version: 'Alpha 0.8.0.61', notes: ['Added first-open Master Command Center tutorial tour.', 'Made the planet access tooltip one-time only.'] },
    { version: 'Alpha 0.7.6.60', notes: ['Fixed title menu interaction regressions.'] },
    { version: 'Alpha 0.7.5.59', notes: ['Restored essential HUD visibility after initial onboarding changes.'] },
    { version: 'Alpha 0.7.4.58', notes: ['Disabled Master Command at first launch until initial build guidance is complete.', 'Added max-slot warning and improved deployment slot highlighting.', 'Added boss defeat notice before rewards.'] },
    { version: 'Alpha 0.7.3.57', notes: ['Added faster splash/loading visibility to reduce black screen time on mobile.'] },
    { version: 'Alpha 0.7.2.56', notes: ['Fixed boss HUD and alert overlap with the play area.'] },
    { version: 'Alpha 0.7.1.55', notes: ['Temporarily hides unresolved onboarding tooltips during deployment mode.'] },
    { version: 'Alpha 0.7.0.54', notes: ['Allows boss ship control by dragging anywhere in the play area.', 'Temporarily hides unresolved tooltips during active waves.'] },
    { version: 'Alpha 0.6.3.53', notes: ['Improved mobile encyclopedia safe-area spacing.'] },
    { version: 'Alpha 0.6.2.52', notes: ['Started title-screen BGM playback with Blackout Velocity.'] },
    { version: 'Alpha 0.6.1.51', notes: ['Added default and boss-fight background music support.'] },
    { version: 'Alpha 0.6.0.50', notes: ['Added visible game version on the title screen.', 'Cleaned directive descriptions and removed Dense Formation Tactics.'] },
    { version: 'Alpha 0.5.0.49', notes: ['Added Space Encyclopedia sections for satellites, enemies, and Command Directives.', 'Expanded encyclopedia layout and mobile scrolling.'] },
    { version: 'Alpha 0.4.0.48', notes: ['Implemented Command Directives from the CSV source.', 'Added directive levels, rarity, max level rules, and Master Command listing.'] },
    { version: 'Alpha 0.3.0.47', notes: ['Introduced boss-round prototype, boss rewards, and the first persistent version counter.'] }
];

export const BASE_ORBIT_PATHS = [110, 175, 240];
export const ORBIT_UNLOCK_COSTS = [0, 3000, 9000];

export const PLANET_THEMES = {
    oasis: { coreStart: '#1d4ed8', coreEnd: '#0f172a', land: '#10b981', shield: 'rgba(56, 189, 248, ' },
    vulcan: { coreStart: '#ea580c', coreEnd: '#450a0a', land: '#7f1d1d', shield: 'rgba(239, 68, 68, ' },
    wasteland: { coreStart: '#7e22ce', coreEnd: '#1e1b4b', land: '#a3e635', shield: 'rgba(168, 85, 247, ' },
    frost: { coreStart: '#22d3ee', coreEnd: '#0f172a', land: '#f1f5f9', shield: 'rgba(165, 243, 252, ' }
};

export const BGM_TRACKS = {
    default: { src: 'elements/Blackout_Velocity.mp3', volume: 0.34 },
    boss: { src: 'elements/Hull_Breach_Alarm.mp3', volume: 0.46 }
};

export const PLANET_TEXTURE_FILES = {
    oasis: 'elements/earth-texture.png',
    vulcan: 'elements/vulcan-texture.png',
    wasteland: 'elements/toxic-texture.png',
    frost: 'elements/frost-texture.png'
};

export const SATELLITE_SPRITE_FILES = {
    laser: 'elements/turret.png',
    plasma: 'elements/plasma.png',
    missile: 'elements/missile.png',
    railgun: 'elements/railgun.png',
    lasersentry: 'elements/laser-sentry.png',
    lightningsentry: 'elements/lightning-sentry.png',
    magnetsentry: 'elements/magnet-sentry.png'
};

export const ORBIT_COLORS = ['rgba(56, 189, 248, 0.25)', 'rgba(16, 185, 129, 0.25)', 'rgba(168, 85, 247, 0.25)'];
export const ORBIT_HOVER_COLORS = ['rgba(56, 189, 248, 0.6)', 'rgba(16, 185, 129, 0.6)', 'rgba(168, 85, 247, 0.6)'];

export const SATELLITE_CONFIGS = {
    laser: {
        name: 'Turret', color: '#38bdf8', cost: 100, baseDamage: 12, baseRange: 150, baseCooldown: 40, projSpeed: 10,
        draw: (ctx, x, y, size, angle = 0) => {
            ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
            ctx.fillStyle = '#f59e0b'; ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 0, size / 1.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillRect(0, -2, size * 1.3, 4);
            ctx.restore();
        }
    },
    plasma: {
        name: 'Plasma Obliterator', color: '#10b981', cost: 180, baseDamage: 24, baseRange: 200, baseCooldown: 90, projSpeed: 5,
        draw: (ctx, x, y, size, angle = 0) => {
            ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
            ctx.fillStyle = '#064e3b'; ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(size * 1.15, 0); ctx.lineTo(-size * 0.7, size * 0.85); ctx.lineTo(-size * 0.35, 0); ctx.lineTo(-size * 0.7, -size * 0.85); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.arc(-size * 0.05, 0, size * 0.38, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#a7f3d0'; ctx.beginPath(); ctx.arc(-size * 0.05, 0, size * 0.58, -0.8, 0.8); ctx.stroke();
            ctx.restore();
        }
    },
    missile: {
        name: 'Missile Battery', color: '#ef4444', cost: 350, baseDamage: 75, baseRange: 290, baseCooldown: 150, projSpeed: 3.5,
        draw: (ctx, x, y, size, angle = 0) => {
            ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
            ctx.fillStyle = '#7f1d1d'; ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5;
            ctx.fillRect(-size * 0.85, -size * 0.8, size * 1.2, size * 0.52); ctx.strokeRect(-size * 0.85, -size * 0.8, size * 1.2, size * 0.52);
            ctx.fillRect(-size * 0.85, size * 0.28, size * 1.2, size * 0.52); ctx.strokeRect(-size * 0.85, size * 0.28, size * 1.2, size * 0.52);
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath(); ctx.moveTo(size * 0.65, -size * 0.54); ctx.lineTo(size * 1.1, -size * 0.28); ctx.lineTo(size * 0.65, -size * 0.02); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(size * 0.65, size * 0.28); ctx.lineTo(size * 1.1, size * 0.54); ctx.lineTo(size * 0.65, size * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(-size * 0.25, 0, size * 0.32, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    },
    railgun: {
        name: 'EMP Rail Accelerator', color: '#a855f7', cost: 500, baseDamage: 140, baseRange: 360, baseCooldown: 220, projSpeed: 25,
        draw: (ctx, x, y, size, angle = 0) => {
            ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
            ctx.fillStyle = '#581c87'; ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(-size * 0.35, 0, size * 0.62, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-size * 0.25, -size * 0.34); ctx.lineTo(size * 1.15, -size * 0.34); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-size * 0.25, size * 0.34); ctx.lineTo(size * 1.15, size * 0.34); ctx.stroke();
            ctx.strokeStyle = '#f5d0fe'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(size * 0.1, 0); ctx.lineTo(size * 1.25, 0); ctx.stroke();
            ctx.fillStyle = '#e9d5ff'; ctx.beginPath(); ctx.arc(size * 1.25, 0, size * 0.16, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    },
    lasersentry: {
        name: 'Laser Sentry Array', color: '#22d3ee', cost: 260, baseDamage: 4, baseRange: 180, baseCooldown: 12, projSpeed: 32,
        draw: (ctx, x, y, size) => {
            ctx.fillStyle = '#f97316'; ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#fed7aa'; ctx.strokeStyle = '#ffedd5';
            ctx.beginPath(); ctx.arc(x, y, size * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#7c2d12';
            ctx.beginPath(); ctx.arc(x, y, size * 0.18, 0, Math.PI * 2); ctx.fill();
        }
    },
    lightningsentry: {
        name: 'Tesla Lightning Sentry', color: '#f59e0b', cost: 380, baseDamage: 35, baseRange: 260, baseCooldown: 100, projSpeed: 12,
        draw: (ctx, x, y, size) => {
            ctx.save();
            ctx.fillStyle = '#78350f'; ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(x, y, size * 0.95, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath(); ctx.arc(x, y, size * 0.42, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fef3c7'; ctx.lineWidth = 1.2;
            for (let i = 0; i < 6; i++) {
                const angle = i * Math.PI / 3;
                const inner = size * 0.55;
                const outer = size * 1.25;
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
                ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
                ctx.stroke();
            }
            ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x, y, size * 1.18, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
    },
    magnetsentry: {
        name: 'Gravitational Magnet Field', color: '#3b82f6', cost: 280, baseDamage: 2, baseRange: 160, baseCooldown: 140, projSpeed: 7,
        draw: (ctx, x, y, size) => {
            ctx.fillStyle = '#22d3ee'; ctx.strokeStyle = '#0891b2'; ctx.lineWidth = 1.5;
            ctx.fillRect(x - size / 1.2, y - size / 1.2, size * 1.6, size * 1.6); ctx.strokeRect(x - size / 1.2, y - size / 1.2, size * 1.6, size * 1.6);
            ctx.beginPath(); ctx.arc(x, y, size / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
    }
};

export const ENEMY_SPRITE_FILES = {
    'Meteoroid': 'elements/meteoroid.png',
    'Meteor': 'elements/meteor.png',
    'Asteroid': 'elements/asteroid.png',
    'Comet': 'elements/comet.png',
    'Scout Fighter': 'elements/scout-fighter.png',
    'Void Swarmer': 'elements/void-swarmer.png',
    'Armored Cruiser': 'elements/armored-cruiser.png',
    'Void Harvester': 'elements/void-harvester.png',
    'Abyss Regent': 'elements/boss-abyss-regent.png',
    'Gravemind Carrier': 'elements/boss-gravemind-carrier.png',
    'Solar Warden': 'elements/boss-solar-warden.png',
    'Null Engine': 'elements/boss-null-engine.png',
    'Iron Basilica': 'elements/boss-iron-basilica.png',
    'Dread Orchard': 'elements/boss-dread-orchard.png',
    'Vortex Saint': 'elements/boss-vortex-saint.png',
    'Eclipse Foundry': 'elements/boss-eclipse-foundry.png',
    'Omega Crucible': 'elements/boss-omega-crucible.png',
    'Chronos Devourer': 'elements/boss-chronos-devourer.png',
    'Rogue Comet': 'elements/comet.png',
    'Smuggler Ship': 'elements/scout-fighter.png'
};

export const ENEMY_PROFILES = [
            { type: 'Meteoroid', category: 'normal', color: '#94a3b8', size: 8, speed: 1.15, maxHp: 16, damage: 8, goldReward: 10, threatCost: 1 },
            { type: 'Meteor', category: 'normal', color: '#fb923c', size: 11, speed: 1.0, maxHp: 34, damage: 14, goldReward: 18, threatCost: 2 },
            { type: 'Asteroid', category: 'normal', color: '#a3a3a3', size: 16, speed: 0.78, maxHp: 75, damage: 24, goldReward: 35, threatCost: 4 },
            { type: 'Comet', category: 'normal', color: '#67e8f9', size: 20, speed: 0.95, maxHp: 140, damage: 38, goldReward: 65, threatCost: 8 },
            { type: 'Scout Fighter', category: 'ship', color: '#38bdf8', size: 11, speed: 1.75, maxHp: 35, damage: 8, goldReward: 25, attackRange: 125, attackCooldown: 55, threatCost: 3 },
            { type: 'Void Swarmer', category: 'ship', color: '#fb7185', size: 8, speed: 2.2, maxHp: 28, damage: 6, goldReward: 18, attackRange: 105, attackCooldown: 38, threatCost: 2 },
            { type: 'Armored Cruiser', category: 'ship', color: '#fbbf24', size: 18, speed: 0.82, maxHp: 120, damage: 18, goldReward: 60, attackRange: 155, attackCooldown: 70, threatCost: 7 },
            { type: 'Void Harvester', category: 'miniboss', color: '#f43f5e', size: 25, speed: 0.58, maxHp: 180, damage: 24, goldReward: 120, attackRange: 140, attackCooldown: 110, threatCost: 15 },
            { type: 'Rogue Comet', category: 'anomaly', color: '#0ea5e9', size: 24, speed: 2.2, maxHp: 350, damage: 50, goldReward: 400, threatCost: 0 },
            { type: 'Smuggler Ship', category: 'anomaly', color: '#d946ef', size: 16, speed: 1.9, maxHp: 180, damage: 15, goldReward: 250, threatCost: 0 }
        ];

export const BOSS_SHIPS = [
            { name: 'Abyss Regent', color: '#f43f5e', maxHp: 1800, fireRate: 48, skill: 'Crimson spread cannons', minions: 12 },
            { name: 'Gravemind Carrier', color: '#a855f7', maxHp: 2200, fireRate: 60, skill: 'Summons extra swarmers', minions: 14 },
            { name: 'Solar Warden', color: '#f59e0b', maxHp: 2500, fireRate: 42, skill: 'Triple thermal volleys', minions: 15 },
            { name: 'Null Engine', color: '#38bdf8', maxHp: 2700, fireRate: 38, skill: 'Fast needle barrages', minions: 16 },
            { name: 'Iron Basilica', color: '#94a3b8', maxHp: 3200, fireRate: 64, skill: 'Armored hull and heavy shots', minions: 17 },
            { name: 'Dread Orchard', color: '#10b981', maxHp: 3000, fireRate: 52, skill: 'Regenerates slowly', minions: 18 },
            { name: 'Vortex Saint', color: '#818cf8', maxHp: 3400, fireRate: 46, skill: 'Spiral projectile pattern', minions: 19 },
            { name: 'Eclipse Foundry', color: '#fb7185', maxHp: 3800, fireRate: 58, skill: 'Deploys escort drones', minions: 20 },
            { name: 'Omega Crucible', color: '#ef4444', maxHp: 4200, fireRate: 40, skill: 'Rage fire below half HP', minions: 22 },
            { name: 'Chronos Devourer', color: '#facc15', maxHp: 5000, fireRate: 34, skill: 'Final boss speed storm', minions: 24 }
        ];

export const BOSS_WEAPON_ENHANCEMENTS = ['twin', 'spread', 'heavy', 'rapid', 'homing', 'explosive', 'wave', 'side', 'ring', 'rear'];

export const BOSS_FIRST_WAVE = 4;

export const BOSS_ROUND_INTERVAL = 3;

export const DIRECTIVE_RARITY_COLORS = {
            Common: '#94a3b8',
            Uncommon: '#34d399',
            Rare: '#38bdf8',
            Epic: '#c084fc',
            Legendary: '#fbbf24'
        };

export const DIRECTIVE_RARITY_WEIGHTS = {
            Common: 36,
            Uncommon: 28,
            Rare: 22,
            Epic: 11,
            Legendary: 3
        };

export const COMMAND_DIRECTIVES = [
            { id: 'overclocked_satellites', name: 'Overclocked Satellites', rarity: 'Rare', tier: 'A', effect: 'fireRate', values: [0.12, 0.20, 0.30, 0.42, 0.55], levels: ['Fire rate +12%', '+20%', '+30%', '+42%', '+55%'] },
            { id: 'focused_targeting_ai', name: 'Focused Targeting AI', rarity: 'Rare', tier: 'A', effect: 'damage', values: [0.18, 0.30, 0.45, 0.65, 0.90], levels: ['Damage +18%', '+30%', '+45%', '+65%', '+90%'] },
            { id: 'extended_sensor_grid', name: 'Extended Sensor Grid', rarity: 'Uncommon', tier: 'B', effect: 'range', values: [0.15, 0.25, 0.35, 0.50, 0.70], levels: ['Range +15%', '+25%', '+35%', '+50%', '+70%'] },
            { id: 'shield_leech_protocol', name: 'Shield Leech Protocol', rarity: 'Epic', tier: 'A', effect: 'shieldPerKill', values: [2, 3, 4, 5, 7], levels: ['+2 shield per kill', '+3 shield', '+4 shield', '+5 shield', '+7 shield'] },
            { id: 'emergency_funding', name: 'Emergency Funding', rarity: 'Common', tier: 'B', effect: 'grantGold', values: [300, 500, 750, 1100, 1600], levels: ['+300 credits', '+500', '+750', '+1,100', '+1,600'] },
            { id: 'risk_contract', name: 'Risk Contract', rarity: 'Epic', tier: 'A', effect: 'riskContract', values: [{ enemy: 0.25, reward: 0.40 }, { enemy: 0.35, reward: 0.65 }, { enemy: 0.50, reward: 1.00 }, { enemy: 0.65, reward: 1.40 }, { enemy: 0.80, reward: 1.90 }], levels: ['Next wave +25% enemies, rewards +40%', '+35% enemies, +65% rewards', '+50% enemies, +100% rewards', '+65% enemies, +140% rewards', '+80% enemies, +190% rewards'] },
            { id: 'magnet_amplifier', name: 'Magnet Amplifier', rarity: 'Rare', tier: 'B', effect: 'magnetSlowTo', values: [0.65, 0.58, 0.52, 0.47, 0.42], levels: ['Enemy speed reduced to 65%', '58%', '52%', '47%', '42%'] },
            { id: 'laser_calibration', name: 'Laser Calibration', rarity: 'Rare', tier: 'A', effect: 'laserRamp', values: [0.35, 0.65, 1.00, 1.45, 2.00], levels: ['Laser ramp +35% faster', '+65%', '+100%', '+145%', '+200%'] },
            { id: 'orbital_recycling_doctrine', name: 'Orbital Recycling Doctrine', rarity: 'Uncommon', tier: 'B', effect: 'salvage', values: [0.25, 0.45, 0.70, 1.00, 1.40], levels: ['Salvage value +25%', '+45%', '+70%', '+100%', '+140%'] },
            { id: 'rapid_deployment_protocol', name: 'Rapid Deployment Protocol', rarity: 'Rare', tier: 'A', effect: 'buildDiscount', values: [0.12, 0.20, 0.30, 0.40, 0.50], levels: ['New satellites cost 12% less', '20% less', '30% less', '40% less', '50% less'] },
            { id: 'reinforced_satellite_hulls', name: 'Reinforced Satellite Hulls', rarity: 'Uncommon', tier: 'B', effect: 'satelliteHp', values: [0.35, 0.60, 0.90, 1.25, 1.65], levels: ['Satellite HP +35%', '+60%', '+90%', '+125%', '+165%'] },
            { id: 'auto_repair_nanobots', name: 'Auto-Repair Nanobots', rarity: 'Rare', tier: 'A', effect: 'waveRepair', values: [0.10, 0.18, 0.28, 0.40, 0.55], levels: ['Satellites recover 10% HP between waves', '18%', '28%', '40%', '55%'] },
            { id: 'emergency_repair_crew', name: 'Emergency Repair Crew', rarity: 'Common', tier: 'B', effect: 'repairAll', values: [0.40, 0.60, 0.80, 1.00, 1.20], levels: ['Repair all satellites by 40%', '60%', '80%', '100%', '100% + temporary HP shield'] },
            { id: 'planetary_fortification', name: 'Planetary Fortification', rarity: 'Common', tier: 'B', effect: 'coreMaxHp', values: [30, 60, 100, 150, 220], levels: ['Planet core max HP +30', '+60', '+100', '+150', '+220'] },
            { id: 'shield_capacitor_bank', name: 'Shield Capacitor Bank', rarity: 'Common', tier: 'B', effect: 'maxShield', values: [25, 50, 85, 130, 190], levels: ['Max shield +25', '+50', '+85', '+130', '+190'] },
            { id: 'reactive_shielding', name: 'Reactive Shielding', rarity: 'Epic', tier: 'A', effect: 'shieldBreakDamage', values: [80, 140, 220, 320, 460], levels: ['Shield break shockwave: 80 damage', '140 damage', '220 damage', '320 damage + brief slow', '460 damage + stronger slow'] },
            { id: 'last_stand_matrix', name: 'Last Stand Matrix', rarity: 'Rare', tier: 'A', effect: 'lastStandRate', values: [0.25, 0.40, 0.60, 0.85, 1.20], levels: ['Below 30% core HP, fire rate +25%', '+40%', '+60%', '+85%', '+120%'] },
            { id: 'core_stabilizer', name: 'Core Stabilizer', rarity: 'Rare', tier: 'A', effect: 'coreDamageReduction', values: [0.15, 0.25, 0.35, 0.45, 0.55], levels: ['Planet takes 15% less direct damage', '25% less', '35% less', '45% less', '55% less'] },
            { id: 'bounty_targeting_system', name: 'Bounty Targeting System', rarity: 'Uncommon', tier: 'B', effect: 'shipReward', values: [0.50, 0.85, 1.25, 1.75, 2.40], levels: ['Ship rewards +50%', '+85%', '+125%', '+175%', '+240%'] },
            { id: 'scrap_collector_drones', name: 'Scrap Collector Drones', rarity: 'Rare', tier: 'A', effect: 'scrapEveryKills', values: [{ kills: 10, gold: 80 }, { kills: 9, gold: 100 }, { kills: 8, gold: 130 }, { kills: 7, gold: 170 }, { kills: 6, gold: 230 }], levels: ['Every 10 kills: +80 credits', 'Every 9 kills: +100', 'Every 8 kills: +130', 'Every 7 kills: +170', 'Every 6 kills: +230'] },
            { id: 'wave_completion_bonus', name: 'Wave Completion Bonus', rarity: 'Rare', tier: 'A', effect: 'waveGold', values: [150, 275, 450, 700, 1050], levels: ['+150 credits after each wave', '+275', '+450', '+700', '+1,050'] },
            { id: 'interest_protocol', name: 'Interest Protocol', rarity: 'Legendary', tier: 'S', effect: 'interest', values: [{ rate: 0.08, cap: 400 }, { rate: 0.10, cap: 600 }, { rate: 0.12, cap: 900 }, { rate: 0.14, cap: 1300 }, { rate: 0.16, cap: 1800 }], levels: ['+8% of current credits after wave, cap 400', '+10%, cap 600', '+12%, cap 900', '+14%, cap 1,300', '+16%, cap 1,800'] },
            { id: 'high_risk_funding', name: 'High-Risk Funding', rarity: 'Epic', tier: 'A', effect: 'shieldForGold', values: [{ shield: 20, gold: 600 }, { shield: 25, gold: 1000 }, { shield: 35, gold: 1600 }, { shield: 45, gold: 2400 }, { shield: 60, gold: 3500 }], levels: ['Lose 20 shield, gain +600 credits', 'Lose 25, gain +1,000', 'Lose 35, gain +1,600', 'Lose 45, gain +2,400', 'Lose 60, gain +3,500'] },
            { id: 'inner_orbit_mastery', name: 'Inner Orbit Mastery', rarity: 'Rare', tier: 'A', effect: 'innerRate', values: [0.25, 0.40, 0.60, 0.85, 1.20], levels: ['Inner orbit fire rate +25%', '+40%', '+60%', '+85%', '+120%'] },
            { id: 'middle_orbit_calibration', name: 'Middle Orbit Calibration', rarity: 'Rare', tier: 'A', effect: 'middleDamage', values: [0.20, 0.35, 0.55, 0.80, 1.15], levels: ['Middle orbit damage +20%', '+35%', '+55%', '+80%', '+115%'] },
            { id: 'outer_orbit_longshot', name: 'Outer Orbit Longshot', rarity: 'Uncommon', tier: 'B', effect: 'outerRange', values: [0.25, 0.40, 0.60, 0.85, 1.20], levels: ['Outer orbit range +25%', '+40%', '+60%', '+85%', '+120%'] },
            { id: 'orbital_expansion_grant', name: 'Orbital Expansion Grant', rarity: 'Legendary', tier: 'S', effect: 'grantSlots', values: [{ slots: 1, gold: 0 }, { slots: 1, gold: 300 }, { slots: 2, gold: 0 }, { slots: 2, gold: 700 }, { slots: 3, gold: 0 }], levels: ['Unlock +1 random slot', '+1 slot + 300 credits', '+2 slots', '+2 slots + 700 credits', '+3 slots'] },
            { id: 'turret_armor_piercer', name: 'Turret Armor Piercer', rarity: 'Uncommon', tier: 'B', effect: 'laserDamage', values: [0.20, 0.35, 0.50, 0.65, 0.80], levels: ['Turret damage +20%', '+35%', '+50%', '+65%', '+80%'] },
            { id: 'plasma_burn_residue', name: 'Plasma Burn Residue', rarity: 'Rare', tier: 'A', effect: 'plasmaDamage', values: [0.20, 0.35, 0.55, 0.80, 1.15], levels: ['Plasma damage +20%', '+35%', '+55%', '+80%', '+115%'] },
            { id: 'missile_cluster_payload', name: 'Missile Cluster Payload', rarity: 'Epic', tier: 'S', effect: 'missileBlast', values: [2, 3, 4, 5, 6], levels: ['Missiles create 2 mini-blasts', '3 mini-blasts', '4 mini-blasts', '5 mini-blasts', '6 mini-blasts + larger radius'] },
            { id: 'railgun_overpenetration', name: 'Railgun Overpenetration', rarity: 'Epic', tier: 'A', effect: 'railgunDamage', values: [0.25, 0.45, 0.70, 1.00, 1.35], levels: ['Railgun damage +25%', '+45%', '+70%', '+100%', '+135%'] },
            { id: 'lightning_chain_relay', name: 'Lightning Chain Relay', rarity: 'Epic', tier: 'S', effect: 'lightningChains', values: [1, 2, 3, 4, 5], levels: ['Lightning chains to +1 enemy', '+2', '+3', '+4', '+5'] },
            { id: 'laser_focus_lens', name: 'Laser Focus Lens', rarity: 'Rare', tier: 'A', effect: 'laserFocus', values: [0.30, 0.50, 0.80, 1.15, 1.60], levels: ['Laser damage +30% after 2s on same target', '+50%', '+80%', '+115%', '+160%'] },
            { id: 'magnetic_trap_field', name: 'Magnetic Trap Field', rarity: 'Rare', tier: 'A', effect: 'slowedDamage', values: [0.12, 0.20, 0.32, 0.48, 0.70], levels: ['Slowed enemies take +12% damage', '+20%', '+32%', '+48%', '+70%'] },
            { id: 'anti_cruiser_targeting', name: 'Anti-Cruiser Targeting', rarity: 'Uncommon', tier: 'B', effect: 'shipDamage', values: [0.25, 0.40, 0.60, 0.85, 1.20], levels: ['+25% damage to enemy ships', '+40%', '+60%', '+85%', '+120%'] },
            { id: 'meteor_shatter_rounds', name: 'Meteor Shatter Rounds', rarity: 'Uncommon', tier: 'B', effect: 'rockDamage', values: [0.20, 0.35, 0.55, 0.80, 1.15], levels: ['Rocks take +20% damage', '+35%', '+55%', '+80%', '+115%'] },
            { id: 'boss_hunter_directive', name: 'Boss Hunter Directive', rarity: 'Epic', tier: 'A', effect: 'strongestDamage', values: [0.30, 0.50, 0.75, 1.05, 1.45], levels: ['Every 5th wave, +30% damage to strongest enemy', '+50%', '+75%', '+105%', '+145%'] },
            { id: 'glass_cannon_protocol', name: 'Glass Cannon Protocol', rarity: 'Epic', tier: 'S', effect: 'glassCannon', values: [{ dmg: 0.35, hp: 0.20 }, { dmg: 0.50, hp: 0.25 }, { dmg: 0.70, hp: 0.30 }, { dmg: 0.95, hp: 0.35 }, { dmg: 1.30, hp: 0.45 }], levels: ['Damage +35%, satellite HP -20%', '+50%, HP -25%', '+70%, HP -30%', '+95%, HP -35%', '+130%, HP -45%'] },
            { id: 'overdrive_cooling_bypass', name: 'Overdrive Cooling Bypass', rarity: 'Epic', tier: 'A', effect: 'overdriveRepair', values: [{ rate: 0.25, repair: 0.40 }, { rate: 0.40, repair: 0.55 }, { rate: 0.60, repair: 0.75 }, { rate: 0.85, repair: 1.00 }, { rate: 1.20, repair: 1.40 }], levels: ['Fire rate +25%, repair cost +40%', '+40%, repair +55%', '+60%, repair +75%', '+85%, repair +100%', '+120%, repair +140%'] },
            { id: 'expanded_sensor_grid_ii', name: 'Expanded Sensor Grid II', rarity: 'Rare', tier: 'A', effect: 'rangeDamageTradeoff', values: [{ range: 0.30, dmg: 0.10 }, { range: 0.50, dmg: 0.12 }, { range: 0.75, dmg: 0.15 }, { range: 1.05, dmg: 0.18 }, { range: 1.45, dmg: 0.22 }], levels: ['Range +30%, damage -10%', '+50%, damage -12%', '+75%, damage -15%', '+105%, damage -18%', '+145%, damage -22%'] },
            { id: 'unstable_plasma_core', name: 'Unstable Plasma Core', rarity: 'Rare', tier: 'A', effect: 'plasmaTradeoff', values: [{ dmg: 0.50, cd: 0.20 }, { dmg: 0.80, cd: 0.25 }, { dmg: 1.20, cd: 0.35 }, { dmg: 1.70, cd: 0.45 }, { dmg: 2.40, cd: 0.60 }], levels: ['Plasma damage +50%, cooldown 20% slower', '+80%, 25% slower', '+120%, 35% slower', '+170%, 45% slower', '+240%, 60% slower'] },
            { id: 'volatile_missile_payload', name: 'Volatile Missile Payload', rarity: 'Epic', tier: 'A', effect: 'missileTradeoff', values: [{ blast: 0.40, rate: 0.25 }, { blast: 0.65, rate: 0.30 }, { blast: 1.00, rate: 0.40 }, { blast: 1.45, rate: 0.50 }, { blast: 2.10, rate: 0.65 }], levels: ['Missile blast +40%, fire rate -25%', '+65%, fire rate -30%', '+100%, fire rate -40%', '+145%, fire rate -50%', '+210%, fire rate -65%'] },
            { id: 'railgun_power_surge', name: 'Railgun Power Surge', rarity: 'Epic', tier: 'A', effect: 'railgunUpgradeTradeoff', values: [{ dmg: 0.30, cost: 0.30 }, { dmg: 0.50, cost: 0.40 }, { dmg: 0.75, cost: 0.55 }, { dmg: 1.05, cost: 0.70 }, { dmg: 1.40, cost: 0.90 }], levels: ['Railgun pierces +2, upgrade cost +30%', '+3, cost +40%', '+4, cost +55%', '+5, cost +70%', '+6, cost +90%'] },
            { id: 'laser_overfocus', name: 'Laser Overfocus', rarity: 'Rare', tier: 'B', effect: 'laserOverfocus', values: [{ ramp: 0.50, retarget: 0.15 }, { ramp: 0.85, retarget: 0.20 }, { ramp: 1.30, retarget: 0.25 }, { ramp: 1.90, retarget: 0.35 }, { ramp: 2.70, retarget: 0.45 }], levels: ['Laser ramp +50%', '+85%', '+130%', '+190%', '+270%'] },
            { id: 'magnetic_singularity_field', name: 'Magnetic Singularity Field', rarity: 'Rare', tier: 'A', effect: 'magnetTradeoff', values: [{ slow: 0.55, range: 0.20 }, { slow: 0.48, range: 0.25 }, { slow: 0.40, range: 0.30 }, { slow: 0.32, range: 0.35 }, { slow: 0.22, range: 0.45 }], levels: ['Stronger slow, Magnet range -20%', 'Stronger slow, range -25%', 'Very strong slow, range -30%', 'Extreme slow, range -35%', 'Near-stop slow, range -45%'] },
            { id: 'lightning_storm_relay', name: 'Lightning Storm Relay', rarity: 'Epic', tier: 'A', effect: 'lightningTradeoff', values: [{ chains: 2, dmg: 0.15 }, { chains: 3, dmg: 0.18 }, { chains: 4, dmg: 0.22 }, { chains: 5, dmg: 0.26 }, { chains: 6, dmg: 0.30 }], levels: ['Lightning chains +2, damage -15%', '+3, damage -18%', '+4, damage -22%', '+5, damage -26%', '+6, damage -30%'] },
            { id: 'emergency_war_budget', name: 'Emergency War Budget', rarity: 'Epic', tier: 'A', effect: 'warBudget', values: [{ gold: 1000, enemy: 0.40 }, { gold: 1700, enemy: 0.55 }, { gold: 2700, enemy: 0.75 }, { gold: 4000, enemy: 1.00 }, { gold: 6000, enemy: 1.35 }], levels: ['+1,000 credits, next wave +40% enemies', '+1,700, +55% enemies', '+2,700, +75% enemies', '+4,000, +100% enemies', '+6,000, +135% enemies'] },
            { id: 'debt_financing', name: 'Debt Financing', rarity: 'Rare', tier: 'A', effect: 'debtFinancing', values: [{ discount: 0.35, loss: 0.10 }, { discount: 0.45, loss: 0.12 }, { discount: 0.60, loss: 0.15 }, { discount: 0.70, loss: 0.18 }, { discount: 0.80, loss: 0.22 }], levels: ['Satellite costs -35%, lose 10% credits each wave', '-45%, lose 12%', '-60%, lose 15%', '-70%, lose 18%', '-80%, lose 22%'] },
            { id: 'reckless_expansion', name: 'Reckless Expansion', rarity: 'Legendary', tier: 'S', effect: 'recklessExpansion', values: [{ slots: 2, hp: 30 }, { slots: 3, hp: 45 }, { slots: 4, hp: 65 }, { slots: 5, hp: 90 }, { slots: 6, hp: 125 }], levels: ['Unlock +2 random slots, core max HP -30', '+3 slots, HP -45', '+4 slots, HP -65', '+5 slots, HP -90', '+6 slots, HP -125'] },
            { id: 'shield_to_weapon_converter', name: 'Shield-to-Weapon Converter', rarity: 'Epic', tier: 'A', effect: 'shieldWeapon', values: [{ dmg: 0.25, shield: 35 }, { dmg: 0.40, shield: 50 }, { dmg: 0.60, shield: 75 }, { dmg: 0.85, shield: 105 }, { dmg: 1.20, shield: 145 }], levels: ['Damage +25%, max shield -35', '+40%, shield -50', '+60%, shield -75', '+85%, shield -105', '+120%, shield -145'] },
            { id: 'core_powered_defense_grid', name: 'Core-Powered Defense Grid', rarity: 'Legendary', tier: 'S', effect: 'corePowered', values: [{ dmg: 0.20, rate: 0.20, taken: 0.20 }, { dmg: 0.35, rate: 0.30, taken: 0.25 }, { dmg: 0.55, rate: 0.45, taken: 0.35 }, { dmg: 0.80, rate: 0.65, taken: 0.45 }, { dmg: 1.15, rate: 0.90, taken: 0.60 }], levels: ['Damage +20%, fire rate +20%, planet takes +20% direct damage', '+35%, +30%, damage taken +25%', '+55%, +45%, damage taken +35%', '+80%, +65%, damage taken +45%', '+115%, +90%, damage taken +60%'] },
            { id: 'fragile_shield_matrix', name: 'Fragile Shield Matrix', rarity: 'Epic', tier: 'A', effect: 'fragileShield', values: [{ shieldKill: 5, maxLoss: 0.25 }, { shieldKill: 8, maxLoss: 0.30 }, { shieldKill: 12, maxLoss: 0.35 }, { shieldKill: 17, maxLoss: 0.40 }, { shieldKill: 24, maxLoss: 0.50 }], levels: ['+5 shield per kill, max shield -25%', '+8, max shield -30%', '+12, max shield -35%', '+17, max shield -40%', '+24, max shield -50%'] },
            { id: 'bounty_hunter_contract', name: 'Bounty Hunter Contract', rarity: 'Legendary', tier: 'S', effect: 'rewardHpTradeoff', values: [{ reward: 0.60, hp: 0.20 }, { reward: 0.90, hp: 0.30 }, { reward: 1.30, hp: 0.45 }, { reward: 1.80, hp: 0.65 }, { reward: 2.50, hp: 0.90 }], levels: ['Enemy rewards +60%, enemy HP +20%', '+90%, HP +30%', '+130%, HP +45%', '+180%, HP +65%', '+250%, HP +90%'] },
            { id: 'elite_threat_incentive', name: 'Elite Threat Incentive', rarity: 'Epic', tier: 'A', effect: 'eliteIncentive', values: [{ reward: 3, spawn: 0.30 }, { reward: 4, spawn: 0.40 }, { reward: 5, spawn: 0.55 }, { reward: 6, spawn: 0.75 }, { reward: 8, spawn: 1.00 }], levels: ['Mini-Boss rewards x3, Mini-Boss spawns +30%', 'x4, spawns +40%', 'x5, spawns +55%', 'x6, spawns +75%', 'x8, spawns +100%'] },
            { id: 'meteor_harvest_protocol', name: 'Meteor Harvest Protocol', rarity: 'Rare', tier: 'B', effect: 'rockRewardSpeed', values: [{ reward: 0.50, speed: 0.25 }, { reward: 0.80, speed: 0.35 }, { reward: 1.20, speed: 0.45 }, { reward: 1.70, speed: 0.60 }, { reward: 2.40, speed: 0.80 }], levels: ['Rock rewards +50%, rock speed +25%', '+80%, speed +35%', '+120%, speed +45%', '+170%, speed +60%', '+240%, speed +80%'] },
            { id: 'orbital_compression_strategy', name: 'Orbital Compression Strategy', rarity: 'Rare', tier: 'B', effect: 'orbitCompression', values: [{ rate: 0.40, range: 0.20 }, { rate: 0.60, range: 0.25 }, { rate: 0.85, range: 0.35 }, { rate: 1.15, range: 0.45 }, { rate: 1.55, range: 0.60 }], levels: ['Inner orbit fire rate +40%, outer range -20%', '+60%, range -25%', '+85%, range -35%', '+115%, range -45%', '+155%, range -60%'] },
            { id: 'final_stand_doctrine', name: 'Final Stand Doctrine', rarity: 'Epic', tier: 'A', effect: 'finalStand', values: [{ threshold: 0.40, low: 0.60, high: 0.10 }, { threshold: 0.45, low: 0.85, high: 0.12 }, { threshold: 0.50, low: 1.20, high: 0.15 }, { threshold: 0.55, low: 1.65, high: 0.18 }, { threshold: 0.60, low: 2.30, high: 0.22 }], levels: ['Below 40% planet HP: damage +60%; above 40%: damage -10%', 'Below 45%: +85%; above: -12%', 'Below 50%: +120%; above: -15%', 'Below 55%: +165%; above: -18%', 'Below 60%: +230%; above: -22%'] }
        ].map(directive => ({ ...directive, color: DIRECTIVE_RARITY_COLORS[directive.rarity] || '#fbbf24' }));

export const COMMAND_DIRECTIVE_TIERS = {
    'S': { name: 'S-Tier', color: '#facc15' },
    'A': { name: 'A-Tier', color: '#38bdf8' },
    'B': { name: 'B-Tier', color: '#34d399' }
};

// ---------------------------------------------------------------------------
// ENEMY AFFIX SYSTEM
// Every 10 waves a milestone wave fires — all enemies in that wave share
// the same affix, creating a themed wave-wide challenge.
// ---------------------------------------------------------------------------
export const ENEMY_AFFIXES = [
    {
        id: 'reactive',
        name: 'Reactive',
        subtitle: 'Each impact accelerates them!',
        category: 'rock',
        color: '#facc15',
        icon: 'fa-solid fa-bolt',
        desc: 'Rocks gain +5% speed for every hit they take, stacking up to +60%. These fragments seem to feed on kinetic impacts — the more you shoot them, the faster they become. Prioritize one-shot kills.'
    },
    {
        id: 'glacial',
        name: 'Glacial',
        subtitle: 'Death freezes your satellites!',
        category: 'rock',
        color: '#7dd3fc',
        icon: 'fa-solid fa-snowflake',
        desc: 'When a Glacial rock is destroyed, it releases a cryogenic shockwave that disables all nearby Satellites for 3 seconds. Plan your fire patterns carefully — letting too many burst near your defenses can leave you unprotected.'
    },
    {
        id: 'volatile',
        name: 'Volatile',
        subtitle: 'Death triggers an AoE explosion!',
        category: 'rock',
        color: '#f97316',
        icon: 'fa-solid fa-fire',
        desc: 'Volatile rocks detonate on destruction, dealing area damage to any Satellites caught in the blast radius. Position matters — satellites close to impact zones will take heavy structural damage. Lure rocks away before firing.'
    },
    {
        id: 'fissured',
        name: 'Fissured',
        subtitle: 'Splits into fragments on death!',
        category: 'rock',
        color: '#fb923c',
        icon: 'fa-solid fa-circle-nodes',
        desc: 'Destroying a Fissured rock causes it to fracture into 2–3 smaller Meteoroids that continue the attack. The fragments inherit the wave\'s threat level. Avoid letting large Fissured rocks break near your defenses.'
    },
    {
        id: 'ironclad',
        name: 'Ironclad',
        subtitle: 'Cannot be slowed or magnetized!',
        category: 'rock',
        color: '#94a3b8',
        icon: 'fa-solid fa-shield-halved',
        desc: 'Ironclad rocks are completely immune to slowing effects. Gravitational Magnet Fields cannot slow them, and temporal disruptions have no effect. Rely on raw firepower — utility satellites are useless against this threat.'
    },
    {
        id: 'shielded',
        name: 'Shielded',
        subtitle: 'Absorbs damage before HP is touched!',
        category: 'ship',
        color: '#38bdf8',
        icon: 'fa-solid fa-shield',
        desc: 'Shielded ships arrive wrapped in a barrier equal to 30% of their total HP. The barrier absorbs all incoming damage completely until it breaks. Heavy burst weapons like Railguns and Missiles are ideal for punching through quickly.'
    },
    {
        id: 'jammer',
        name: 'Jammer',
        subtitle: 'Periodically disables nearby satellites!',
        category: 'ship',
        color: '#a78bfa',
        icon: 'fa-solid fa-wifi',
        desc: 'Jammer ships emit electronic disruption pulses every 8 seconds, knocking the nearest Satellite offline for 2.5 seconds. Prioritize killing Jammers quickly — multiple Jammers can rotate your defenses into near-permanent silence.'
    },
    {
        id: 'berserk',
        name: 'Berserk',
        subtitle: 'Gets faster and attacks faster at low HP!',
        category: 'ship',
        color: '#f43f5e',
        icon: 'fa-solid fa-skull-crossbones',
        desc: 'Berserk ships enter a frenzy state as they take damage, increasing both their movement speed and attack rate up to +60% at critical HP. Do not leave them to bleed — finish them off quickly before they reach full rampage speed.'
    },
    {
        id: 'commander',
        name: 'Commander',
        subtitle: 'Buffs all nearby enemies!',
        category: 'ship',
        color: '#fbbf24',
        icon: 'fa-solid fa-star',
        desc: 'Commander ships radiate a command aura that grants all nearby enemies +20% HP and +15% movement speed. The aura pulses visibly — prioritize destroying the Commander first to strip buffs from the entire group.'
    },
    {
        id: 'mirror',
        name: 'Mirror Shield',
        subtitle: 'Reflects 15% of incoming damage!',
        category: 'ship',
        color: '#e2e8f0',
        icon: 'fa-solid fa-gem',
        desc: 'Mirror Shield ships reflect 15% of all damage back onto the attacking satellite. High-rate-of-fire satellites can suffer significant self-damage against a cluster of Mirror enemies. Use slow, heavy-hitting weapons to minimize blowback.'
    },
    {
        id: 'gilded',
        name: 'Gilded',
        subtitle: 'Tanky, fast under fire — but drops 3× loot!',
        category: 'both',
        color: '#fde68a',
        icon: 'fa-solid fa-coins',
        desc: 'Gilded enemies arrive with double HP and gain +5% speed whenever they are hit — but destroying them rewards 3× Gold and +2 Cosmic Data each. They are extremely valuable targets. Bring overwhelming firepower and let the riches flow.'
    }
];

// Scheduled affix rotation. Index into ENEMY_AFFIXES by position.
// cycle: 0=reactive, 1=shielded, 2=glacial, 3=jammer, 4=volatile,
//        5=berserk, 6=ironclad, 7=mirror, 8=commander, 9=gilded, 10=fissured
const AFFIX_ROTATION = [
    'reactive', 'shielded', 'glacial', 'jammer', 'volatile',
    'berserk', 'ironclad', 'mirror', 'commander', 'gilded', 'fissured'
];

/**
 * Returns the ENEMY_AFFIX object for a given wave number,
 * or null if it is not a milestone wave (multiple of 10).
 */
export function getWaveAffix(wave) {
    if (wave % 10 !== 0) return null;
    const cycleIndex = (Math.floor(wave / 10) - 1) % AFFIX_ROTATION.length;
    const affixId = AFFIX_ROTATION[cycleIndex];
    return ENEMY_AFFIXES.find(a => a.id === affixId) || null;
}