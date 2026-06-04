import { Enemy } from './entities/Enemy.js';
import { Satellite } from './entities/Satellite.js';
import { Projectile } from './entities/Projectile.js';
import { Particle } from './entities/Particle.js';
import { state } from './state.js';
import { 
    APP_VERSION, TARGET_FRAME_MS, PATCH_NOTES,
    BASE_ORBIT_PATHS, ORBIT_UNLOCK_COSTS, PLANET_THEMES, BGM_TRACKS,
    PLANET_TEXTURE_FILES, SATELLITE_SPRITE_FILES, ORBIT_COLORS, ORBIT_HOVER_COLORS,
    SATELLITE_CONFIGS, ENEMY_SPRITE_FILES, ENEMY_PROFILES, BOSS_SHIPS,
    BOSS_WEAPON_ENHANCEMENTS, BOSS_FIRST_WAVE, BOSS_ROUND_INTERVAL,
    DIRECTIVE_RARITY_COLORS, DIRECTIVE_RARITY_WEIGHTS, COMMAND_DIRECTIVES
} from './config.js';

        // ----------------------------------------------------------------------
        // 1. DOM & GLOBALS
        // ----------------------------------------------------------------------
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        state.canvas = canvas;
        state.ctx = ctx;
        state.playSynthSound = playSynthSound;
        state.createExplosion = createExplosion;
        state.getDirectiveEffectValue = getDirectiveEffectValue;
        
        let lastLoopTimestamp = 0;


        const planetTextures = {};
        Object.entries(PLANET_TEXTURE_FILES).forEach(([themeKey, src]) => {
            const img = new Image();
            img.src = src;
            planetTextures[themeKey] = img;
        });

        const satelliteSprites = {};
        Object.entries(SATELLITE_SPRITE_FILES).forEach(([type, src]) => {
            const img = new Image();
            img.src = src;
            satelliteSprites[type] = img;
        });

        const playerFighterSprite = new Image();
        playerFighterSprite.src = 'elements/player-fighter.png';

        export function drawSatelliteSprite(ctx, type, x, y, size, angle = 0) {
            const sprite = satelliteSprites[type];
            if (sprite && sprite.complete && sprite.naturalWidth > 0 && sprite.naturalHeight > 0) {
                const maxSide = size * 2.7;
                const ratio = Math.min(maxSide / sprite.naturalWidth, maxSide / sprite.naturalHeight);
                const drawW = sprite.naturalWidth * ratio;
                const drawH = sprite.naturalHeight * ratio;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle + Math.PI / 2);
                ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
                ctx.restore();
                return;
            }

            SATELLITE_CONFIGS[type].draw(ctx, x, y, size, angle);
        }

        const enemySprites = {};
        Object.entries(ENEMY_SPRITE_FILES).forEach(([type, src]) => {
            const img = new Image();
            img.src = src;
            enemySprites[type] = img;
        });

        function loadSettings() {
            try {
                const saved = localStorage.getItem('pd_settings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.sfxEnabled !== undefined) state.isSfxEnabled = parsed.sfxEnabled;
                    if (parsed.bgmEnabled !== undefined) state.isBgmEnabled = parsed.bgmEnabled;
                    if (parsed.sfxVolume !== undefined) state.sfxVolume = parsed.sfxVolume;
                    if (parsed.bgmVolume !== undefined) state.bgmVolume = parsed.bgmVolume;
                    if (parsed.scanlines !== undefined) state.isScanlinesEnabled = parsed.scanlines;
                    if (parsed.shakeIntensity !== undefined) state.screenShakeIntensity = parsed.shakeIntensity;
                    if (parsed.devMode !== undefined) state.isDevMode = parsed.devMode;
                    if (parsed.planetName !== undefined) state.planetName = parsed.planetName;
                    if (parsed.planetTheme !== undefined) state.activeThemeKey = parsed.planetTheme;
                    if (parsed.cosmicData !== undefined) state.cosmicData = parsed.cosmicData;
                    if (parsed.research) {
                        state.research = parsed.research;
                        state.research.startSlots = state.research.startSlots || 0;
                        state.research.baseShield = state.research.baseShield || 0;
                        state.research.baseDamage = state.research.baseDamage || 0;
                    }
                }
            } catch (e) { console.warn("Failed to load settings", e); }

            document.querySelectorAll('.planet-name-label').forEach(lbl => lbl.innerText = state.planetName);
            const nameInput = document.getElementById('settings-planet-name');
            if (nameInput) nameInput.value = state.planetName;

            refreshAtmosphereSelection();
            syncScanlineUI();
            syncAudioUI();
            syncBgm();
        }

        function saveSettings() {
            try {
                const settings = {
                    sfxEnabled: state.isSfxEnabled,
                    bgmEnabled: state.isBgmEnabled,
                    sfxVolume: state.sfxVolume,
                    bgmVolume: state.bgmVolume,
                    scanlines: state.isScanlinesEnabled,
                    shakeIntensity: state.screenShakeIntensity,
                    devMode: state.isDevMode,
                    planetName: state.planetName,
                    planetTheme: state.activeThemeKey,
                    cosmicData: state.cosmicData,
                    research: state.research
                };
                localStorage.setItem('pd_settings', JSON.stringify(settings));
            } catch (e) { console.warn("Failed to save settings", e); }
        }

        function applySettingsFromUI() {
            const nameInput = document.getElementById('settings-planet-name');
            if (nameInput) {
                const rawName = nameInput.value.trim();
                state.planetName = rawName !== "" ? rawName.toUpperCase() : "EARTH";
            }

            const sfxT = document.getElementById('settings-sfx-toggle');
            if (sfxT) state.isSfxEnabled = sfxT.checked;

            const bgmT = document.getElementById('settings-bgm-toggle');
            if (bgmT) state.isBgmEnabled = bgmT.checked;

            const sfxV = document.getElementById('settings-sfx-volume');
            if (sfxV) state.sfxVolume = parseFloat(sfxV.value);

            const bgmV = document.getElementById('settings-bgm-volume');
            if (bgmV) state.bgmVolume = parseFloat(bgmV.value);

            const scanT = document.getElementById('settings-scanlines-toggle-new');
            if (scanT) state.isScanlinesEnabled = scanT.checked;

            const shakeV = document.getElementById('settings-shake-intensity');
            if (shakeV) state.screenShakeIntensity = parseFloat(shakeV.value);

            const devT = document.getElementById('settings-dev-mode');
            if (devT) state.isDevMode = devT.checked;

            if (state.isSfxEnabled || state.isBgmEnabled) initAudio();

            saveSettings();
            loadSettings();
        }

        function applyPauseSettingsFromUI() {
            const sfxT = document.getElementById('pause-settings-sfx-toggle');
            if (sfxT) state.isSfxEnabled = sfxT.checked;

            const bgmT = document.getElementById('pause-settings-bgm-toggle');
            if (bgmT) state.isBgmEnabled = bgmT.checked;

            const sfxV = document.getElementById('pause-settings-sfx-volume');
            if (sfxV) state.sfxVolume = parseFloat(sfxV.value);

            const bgmV = document.getElementById('pause-settings-bgm-volume');
            if (bgmV) state.bgmVolume = parseFloat(bgmV.value);

            const scanT = document.getElementById('pause-settings-scanlines-toggle-new');
            if (scanT) state.isScanlinesEnabled = scanT.checked;

            const pShakeV = document.getElementById('pause-settings-shake-intensity');
            if (pShakeV) state.screenShakeIntensity = parseFloat(pShakeV.value);

            if (state.isSfxEnabled || state.isBgmEnabled) initAudio();

            saveSettings();
            loadSettings();
        }

        const PRELOAD_ASSET_URLS = Array.from(new Set([
            ...Object.values(PLANET_TEXTURE_FILES),
            ...Object.values(SATELLITE_SPRITE_FILES),
            ...Object.values(ENEMY_SPRITE_FILES),
            'elements/player-fighter.png',
            ...Object.values(BGM_TRACKS).map(track => track.src)
        ]));

        const ENEMY_SPRITE_SCALE = {
            'Comet': 4.4,
            'Scout Fighter': 4.6,
            'Void Swarmer': 6.4,
            'Armored Cruiser': 3.8,
            'Void Harvester': 3.6,
            'Abyss Regent': 7.2,
            'Gravemind Carrier': 7.2,
            'Solar Warden': 7.2,
            'Null Engine': 7.2,
            'Iron Basilica': 7.2,
            'Dread Orchard': 7.2,
            'Vortex Saint': 7.2,
            'Eclipse Foundry': 7.2,
            'Omega Crucible': 7.2,
            'Chronos Devourer': 7.2,
            'Rogue Comet': 4.4,
            'Smuggler Ship': 4.6
        };

        export function drawEnemySprite(ctx, type, x, y, size, angle = 0) {
            const src = ENEMY_SPRITE_FILES[type];
            const sprite = (window.loadedImagesCache && window.loadedImagesCache[src]) ? window.loadedImagesCache[src] : enemySprites[type];
            if (!sprite || !sprite.complete || sprite.naturalWidth <= 0 || sprite.naturalHeight <= 0) return false;

            const maxSide = size * (ENEMY_SPRITE_SCALE[type] || 3.2);
            const ratio = Math.min(maxSide / sprite.naturalWidth, maxSide / sprite.naturalHeight);
            const drawW = sprite.naturalWidth * ratio;
            const drawH = sprite.naturalHeight * ratio;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);
            ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();
            return true;
        }

        

        

        
         // Test cadence: boss mode starts after completing Wave 3.
        

        function isBossWave(wave) {
            return wave >= BOSS_FIRST_WAVE && (wave - BOSS_FIRST_WAVE) % BOSS_ROUND_INTERVAL === 0;
        }
        const SATELLITE_DESCRIPTIONS = {
            laser: 'Reliable rapid-fire cannon. Deals +50% damage to Ships, but -25% against armored Rocks. Takes +50% damage from Rock collisions.',
            plasma: 'Area blast weapon. Deals +50% damage to clustered Rocks, but -25% against agile Ships. Takes +50% damage from Ship attacks.',
            missile: 'Heavy homing battery. High damage vs Ships and Mini-Bosses (+25%), but slow reload makes it weak to swarms. Takes +25% damage from Rock collisions.',
            railgun: 'Long-range accelerator. Deals +50% damage to heavy Rocks, but -25% against small Ships. Takes +50% damage from Ship attacks.',
            lasersentry: 'Continuous beam array. Ramps damage on a single target. Excellent vs Elites, poor vs swarms.',
            lightningsentry: 'Chain lightning platform. Devastating against large swarms, but weak against single high-HP targets.',
            magnetsentry: 'Gravity field platform. Halts enemy advances but deals minimal damage.'
        };

        const ENEMY_DESCRIPTIONS = {
            'Meteoroid': 'Small fast rock. Low durability, but easy to miss in groups.',
            'Meteor': 'Standard impact rock with higher mass and stronger core damage.',
            'Asteroid': 'Heavy rock with thick plating and high collision damage.',
            'Comet': 'Large icy rock with a wider visual profile and heavier impact threat.',
            'Scout Fighter': 'Fast ship that hunts satellites once it reaches weapon range.',
            'Void Swarmer': 'Small assault craft with rapid movement and quick attack cycles.',
            'Armored Cruiser': 'Durable gunship that advances slowly and pressures satellites.',
            'Void Harvester': 'Mini-Boss. Capital-grade ship with extreme durability and heavy attacks. Arrives with escorts.',
            'Rogue Comet': 'Deep space anomaly. Highly durable and fast. Drops Cosmic Data if destroyed.',
            'Smuggler Ship': 'Deep space anomaly. Highly evasive neutral vessel. Drops Command Directives if destroyed.'
        };

        const DIRECTIVE_EFFECT_CONTEXT = {
            fireRate: 'Global weapon cadence directive. It shortens satellite cooldowns during normal defense waves so existing arrays fire more often.',
            damage: 'Global damage directive. It improves direct satellite damage output against rocks and hostile ships in defense waves.',
            range: 'Sensor coverage directive. It expands acquisition radius so satellites can engage threats earlier and hold targets longer.',
            shieldPerKill: 'Shield economy directive. Every enemy destroyed during defense waves restores shield integrity, rewarding high kill tempo.',
            grantGold: 'Immediate funding directive. Credits are deposited as soon as the directive is selected, helping recover or expand quickly.',
            riskContract: 'Risk-reward directive. Future defense waves become larger, but every kill pays more credits if the defense survives.',
            magnetSlowTo: 'Magnet sentry directive. It strengthens gravitational slow fields, making enemies spend more time inside weapon range.',
            laserRamp: 'Laser sentry directive. Continuous beam weapons reach their high-damage state faster when they stay locked on a target.',
            salvage: 'Logistics directive. Recycling satellites returns more of their invested value, making rebuilds less punishing.',
            buildDiscount: 'Deployment directive. New satellites cost less, allowing faster orbit filling and easier weapon specialization.',
            satelliteHp: 'Durability directive. Satellites gain more hull integrity against ship attacks and rock collisions.',
            waveRepair: 'Maintenance directive. Damaged satellites automatically recover health after each completed defense wave.',
            repairAll: 'Instant repair directive. Existing satellites are repaired when the directive is selected.',
            coreMaxHp: 'Planetary defense directive. It increases core integrity, improving survival after shields collapse.',
            maxShield: 'Shield engineering directive. It increases maximum shield capacity for larger pre-impact protection.',
            shieldBreakDamage: 'Reactive shield directive. When shields collapse, nearby enemies are hit by a defensive shockwave.',
            lastStandRate: 'Emergency combat directive. Satellite fire rate increases only while the planet core is critically damaged.',
            coreDamageReduction: 'Core armor directive. Direct impact damage against the planet is reduced after shields fail.',
            shipReward: 'Bounty directive. Enemy ships pay more credits, prioritizing anti-ship defenses.',
            scrapEveryKills: 'Scrap recovery directive. Kill streak milestones trigger extra credit income.',
            waveGold: 'Operations funding directive. Completing each defense wave grants additional credits.',
            interest: 'Treasury directive. Holding credits between waves generates bonus funding up to a cap.',
            shieldForGold: 'Emergency treasury directive. Converts shield integrity into immediate credits.',
            innerRate: 'Orbit specialization directive. Satellites mounted on the inner orbit gain faster fire rates.',
            middleDamage: 'Orbit specialization directive. Satellites mounted on the middle orbit gain stronger damage.',
            outerRange: 'Orbit specialization directive. Satellites mounted on the outer orbit gain longer range.',
            grantSlots: 'Orbital construction directive. It unlocks extra satellite slots without using the normal orbit expansion purchase.',
            laserDamage: 'Turret weapon directive. Standard turret shots receive a direct damage bonus.',
            plasmaDamage: 'Plasma weapon directive. Plasma projectiles and splash damage receive a direct damage bonus.',
            missileBlast: 'Missile weapon directive. Missile impacts create secondary blasts for better area control.',
            railgunDamage: 'Railgun weapon directive. Railgun shots receive a direct damage bonus.',
            lightningChains: 'Lightning weapon directive. Tesla arcs jump through more enemies per strike.',
            laserFocus: 'Laser sentry directive. Staying on one target rewards the beam with higher sustained damage.',
            slowedDamage: 'Control synergy directive. Enemies affected by slow effects take increased damage.',
            shipDamage: 'Targeting directive. All satellites hit hostile ships harder.',
            rockDamage: 'Targeting directive. All satellites deal more damage to meteoroids, meteors, asteroids, and comets.',
            strongestDamage: 'Priority targeting directive. Periodic heavy-threat waves become easier to burst down.',
            glassCannon: 'High-risk weapon directive. Satellites deal much more damage but become easier to destroy.',
            overdriveRepair: 'High-throughput directive. Fire rate rises, but satellite maintenance becomes more expensive.',
            rangeDamageTradeoff: 'Sensor tradeoff directive. Range expands significantly at the cost of reduced damage.',
            plasmaTradeoff: 'Plasma overload directive. Plasma damage rises sharply, but firing cadence slows.',
            missileTradeoff: 'Missile payload directive. Blast power increases while reload speed suffers.',
            railgunUpgradeTradeoff: 'Railgun surge directive. Railgun piercing improves, but future upgrades cost more.',
            laserOverfocus: 'Laser control directive. Beam sentries build up their sustained damage ramp faster while holding a target.',
            magnetTradeoff: 'Magnet field directive. Slow power becomes stronger while magnet range shrinks.',
            lightningTradeoff: 'Lightning storm directive. Arcs hit more targets, but each strike deals less damage.',
            warBudget: 'Emergency war budget directive. Grants immediate credits while increasing the next defense wave size.',
            debtFinancing: 'Debt directive. Satellite builds become cheaper, but stored credits decay after waves.',
            recklessExpansion: 'Reckless construction directive. Adds orbit slots immediately while reducing planet core durability.',
            shieldWeapon: 'Conversion directive. Weapon damage rises by consuming maximum shield capacity.',
            corePowered: 'Core overdrive directive. Weapons gain damage and speed, but direct planet damage becomes more dangerous.',
            fragileShield: 'Fragile shield directive. Kills restore more shield, but maximum shield capacity is reduced.',
            rewardHpTradeoff: 'Bounty contract directive. Enemy rewards rise, but enemies enter defense waves with more HP.',
            eliteIncentive: 'Elite contract directive. Elite ships become more common and valuable.',
            rockRewardSpeed: 'Meteor harvest directive. Rocks pay more credits but travel faster.',
            orbitCompression: 'Orbit compression directive. Inner orbit fire rate increases while outer orbit range is reduced.',
            finalStand: 'Final stand directive. Low core integrity grants major damage, while safer core states reduce damage.'
        };

        function createStatPill(label, value) {
            return `<div class="bg-slate-950/70 border border-slate-800 rounded px-2 py-1">
                <span class="block text-[8px] text-slate-500 uppercase tracking-wider">${label}</span>
                <span class="block text-[10px] text-slate-100 tech-font">${value}</span>
            </div>`;
        }

        function renderEncyclopediaCard({ title, typeLabel, description, spriteSrc, spriteSize, accentColor, stats }) {
            return `<article class="bg-slate-900/85 border border-slate-800 rounded-lg p-2.5 flex gap-3 min-h-[118px]">
                <div class="w-24 shrink-0 flex items-center justify-center bg-slate-950/70 border border-slate-800 rounded-md overflow-hidden">
                    <img src="${spriteSrc}" alt="${title}" style="width:${spriteSize}px; height:auto;" draggable="false">
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <h4 class="text-[11px] font-black uppercase tracking-wide" style="color:${accentColor}">${title}</h4>
                            <div class="text-[8px] text-slate-500 uppercase tracking-widest">${typeLabel}</div>
                        </div>
                    </div>
                    <p class="text-[9px] text-slate-400 leading-snug mt-1 font-semibold">${description}</p>
                    <div class="grid grid-cols-2 gap-1 mt-2">${stats.map(stat => createStatPill(stat[0], stat[1])).join('')}</div>
                </div>
            </article>`;
        }

        function renderDirectiveEncyclopediaCard(directive) {
            return `<article class="bg-slate-900/85 border border-amber-500/20 rounded-lg p-2.5 min-h-[118px]">
                <div class="flex items-start justify-between gap-2">
                    <div>
                        <h4 class="text-[11px] font-black uppercase tracking-wide" style="color:${directive.color}">${directive.name}</h4>
                        <div class="text-[8px] text-slate-500 uppercase tracking-widest">${directive.rarity} Directive</div>
                    </div>
                    <div class="text-[8px] text-amber-300 uppercase tracking-widest font-black">Max LVL 5</div>
                </div>
                <p class="text-[9px] text-slate-300 leading-snug mt-2 font-semibold">${getDirectiveContext(directive)}</p>
                <div class="grid grid-cols-1 gap-1 mt-2">
                    ${directive.levels.map((levelText, index) => createStatPill(`LVL ${index + 1}`, levelText)).join('')}
                </div>
            </article>`;
        }

        function populateSpaceEncyclopedia() {
            const satelliteContainer = document.getElementById('encyclopedia-satellites');
            const rocksContainer = document.getElementById('encyclopedia-rocks');
            const shipsContainer = document.getElementById('encyclopedia-ships');
            const directivesContainer = document.getElementById('encyclopedia-directives');
            if (!satelliteContainer || !rocksContainer || !shipsContainer || !directivesContainer) return;

            satelliteContainer.innerHTML = Object.entries(SATELLITE_CONFIGS).map(([type, cfg]) => {
                const spriteSize = Math.round(14 * state.gameScale * 2.7);
                const stats = [
                    ['Cost', `${cfg.cost}G`],
                    ['HP', getSatelliteMaxHp(type)],
                    ['Power', cfg.baseDamage],
                    ['Range', Math.round(cfg.baseRange * state.rangeScale)],
                    ['Rate', `${(cfg.baseCooldown / 60).toFixed(2)}s`],
                    ['Max Level', 10]
                ];

                if (type === 'laser') { stats.push(['Vs Ships', '150%']); stats.push(['Vs Rocks', '75%']); stats.push(['Rock Dmg Taken', '150%']); }
                else if (type === 'plasma') { stats.push(['Vs Ships', '75%']); stats.push(['Vs Rocks', '150%']); stats.push(['Ship Dmg Taken', '150%']); }
                else if (type === 'missile') { stats.push(['Vs Ships', '125%']); stats.push(['Vs Rocks', '100%']); stats.push(['Rock Dmg Taken', '125%']); }
                else if (type === 'railgun') { stats.push(['Vs Ships', '75%']); stats.push(['Vs Rocks', '150%']); stats.push(['Ship Dmg Taken', '150%']); }
                else { stats.push(['Vs Ships', '100%']); stats.push(['Vs Rocks', '100%']); }

                return renderEncyclopediaCard({
                    title: cfg.name,
                    typeLabel: 'Satellite',
                    description: SATELLITE_DESCRIPTIONS[type],
                    spriteSrc: SATELLITE_SPRITE_FILES[type],
                    spriteSize,
                    accentColor: cfg.color,
                    stats
                });
            }).join('');

            const enemyCards = ENEMY_PROFILES.map(profile => {
                const spriteScale = ENEMY_SPRITE_SCALE[profile.type] || 3.2;
                const spriteSize = Math.round(profile.size * state.gameScale * spriteScale);
                const stats = [
                    ['HP', profile.maxHp],
                    ['Damage', profile.damage],
                    ['Speed', profile.speed],
                    ['Reward', `${profile.goldReward}G`]
                ];
                if (profile.category === 'ship') {
                    stats.push(['Atk Range', Math.round((profile.attackRange || 0) * state.rangeScale)]);
                    stats.push(['Atk Rate', `${((profile.attackCooldown || 0) / 60).toFixed(2)}s`]);
                }
                return renderEncyclopediaCard({
                    title: profile.type,
                    typeLabel: profile.category === 'miniboss' ? 'Mini-Boss' : (profile.category === 'ship' ? 'Hostile Ship' : 'Rock'),
                    description: ENEMY_DESCRIPTIONS[profile.type],
                    spriteSrc: ENEMY_SPRITE_FILES[profile.type],
                    spriteSize,
                    accentColor: profile.color,
                    stats
                });
            });

            const bossCards = BOSS_SHIPS.map((boss, index) => renderEncyclopediaCard({
                title: boss.name,
                typeLabel: `Boss Ship ${index + 1}`,
                description: boss.skill,
                spriteSrc: ENEMY_SPRITE_FILES[boss.name],
                spriteSize: Math.round(42 * state.gameScale * (ENEMY_SPRITE_SCALE[boss.name] || 7.2)),
                accentColor: boss.color,
                stats: [
                    ['HP', boss.maxHp],
                    ['Minions', boss.minions],
                    ['Fire Rate', `${(boss.fireRate / 60).toFixed(2)}s`],
                    ['Appears', `Wave ${BOSS_FIRST_WAVE + index * BOSS_ROUND_INTERVAL}`]
                ]
            }));

            rocksContainer.innerHTML = enemyCards.slice(0, 4).join('');
            shipsContainer.innerHTML = enemyCards.slice(4).concat(bossCards).join('');
            const rarityRank = { Legendary: 0, Epic: 1, Rare: 2, Uncommon: 3, Common: 4 };
            directivesContainer.innerHTML = COMMAND_DIRECTIVES
                .slice()
                .sort((a, b) => (rarityRank[a.rarity] ?? 9) - (rarityRank[b.rarity] ?? 9) || a.name.localeCompare(b.name))
                .map(renderDirectiveEncyclopediaCard)
                .join('');
        }

        const RESEARCH_NODES = {
            startSlots: { name: 'Initial Orbit Slots', desc: 'Start runs with extra random slots.', tier: 1, costBase: 15, costScale: 20, capstone: 'Start with Level 2 satellite in slot 1.' },
            baseShield: { name: 'Reinforced Shielding', desc: 'Increase base shield by +25 per level.', tier: 1, costBase: 10, costScale: 15, capstone: 'Planet slowly regenerates 1 shield per second.' },
            baseDamage: { name: 'Weapons Calibration', desc: 'Increase Tactical Ability damage by +5% per level.', tier: 1, costBase: 20, costScale: 30, capstone: 'Tactical abilities AoE size +15%.' },
            economyBounty: { name: 'Bounty Hunter', desc: 'Increase gold bounty from enemies by +2% per level.', tier: 2, costBase: 30, costScale: 25, capstone: 'Start each run with a bonus 500 Gold.' },
            tacticalCooldown: { name: 'Tactical Efficiency', desc: 'Reduce Tactical Ability cooldowns by -2% per level.', tier: 2, costBase: 40, costScale: 35, capstone: 'Tactical abilities start fully charged.' },
            fighterSpeed: { name: 'Interceptor Engines', desc: 'Increase Boss Fighter speed by +2% per level.', tier: 2, costBase: 25, costScale: 20, capstone: 'Fighter gains 2s invulnerability when damaged.' },
            cosmicScavenger: { name: 'Cosmic Scavenger', desc: 'Increase Cosmic Data drops by +5% per level.', tier: 3, costBase: 50, costScale: 40, capstone: 'Bosses drop double Cosmic Data.' },
            fighterHull: { name: 'Reinforced Hull', desc: 'Increase Boss Fighter Max HP by +5% per level.', tier: 3, costBase: 50, costScale: 40, capstone: 'Fighter automatically repairs 1 HP every second.' }
        };

        function refundResearch() {
            let refunded = 0;
            if (!state.research) return;
            for (const key in state.research) {
                const node = RESEARCH_NODES[key];
                if (!node) continue;
                const lvl = state.research[key];
                for (let i = 0; i < lvl; i++) {
                    refunded += node.costBase + (i * node.costScale);
                }
                state.research[key] = 0;
            }
            state.cosmicData += refunded;
            saveSettings();
            updateResearchUI();
            playSynthSound('upgrade');
        }

        function updateResearchUI() {
            try {
                const lbl = document.getElementById('lbl-cosmic-data');
                if (lbl) lbl.innerText = state.cosmicData || 0;
                const list = document.getElementById('research-upgrades-list');
                if (!list) return;

                if (!state.research) state.research = {};
                for (const key in RESEARCH_NODES) if (typeof state.research[key] === 'undefined') state.research[key] = 0;

                let totalSpent = 0;
                for (const key in state.research) totalSpent += state.research[key];

                const tierReq = { 1: 0, 2: 5, 3: 15 };

                let html = `
                    <div class="mb-3 text-right">
                        <button id="btn-refund-research" class="bg-red-900/40 hover:bg-red-600/60 border border-red-500/50 text-red-200 px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all">
                            <i class="fa-solid fa-skull mr-1"></i> Wipe Memory Banks (Refund All)
                        </button>
                    </div>
                `;

                for (let t = 1; t <= 3; t++) {
                    const isLocked = totalSpent < tierReq[t];
                    html += `<div class="mb-2 mt-4"><span class="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-slate-700 pb-1 w-full flex items-center">
                                Tier ${t} Upgrades ${isLocked ? `<span class="text-[9px] text-red-400 ml-2"><i class="fa-solid fa-lock mr-1"></i> Requires ${tierReq[t]} Total Levels</span>` : ''}
                             </span></div>`;

                    for (const key in RESEARCH_NODES) {
                        const node = RESEARCH_NODES[key];
                        if (node.tier !== t) continue;

                        const lvl = state.research[key];
                        const cost = node.costBase + (lvl * node.costScale);
                        const isMax = lvl >= 10;
                        const canAfford = state.cosmicData >= cost && !isMax && !isLocked;

                        html += `
                            <div class="bg-slate-900 border ${isMax ? 'border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'border-slate-800'} rounded-lg p-3 flex flex-col mt-2 relative overflow-hidden ${isLocked ? 'opacity-50 grayscale' : ''}">
                                ${isMax ? '<div class="absolute top-0 right-0 bg-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">Capstone Active</div>' : ''}
                                <div class="flex justify-between items-center w-full">
                                    <div class="pr-2">
                                        <div class="text-slate-200 text-xs font-black uppercase tracking-widest ${isMax ? 'text-purple-300' : ''}">${node.name}</div>
                                        <div class="text-slate-400 text-[9px] mt-0.5">${node.desc} (Lvl ${lvl}/10)</div>
                                        <div class="text-[9px] font-bold ${isMax ? 'text-emerald-400' : 'text-slate-500'} mt-1 flex items-center"><i class="fa-solid fa-crown mr-1"></i> ${node.capstone}</div>
                                    </div>
                                    <button data-research="${key}" data-cost="${cost}" class="research-btn shrink-0 bg-purple-500 hover:bg-purple-400 active:scale-95 text-slate-950 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all pointer-events-auto select-none ${canAfford ? '' : 'opacity-50 cursor-not-allowed'}" ${isLocked ? 'disabled' : ''}>
                                        ${isMax ? 'MAX' : cost + ' CD'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                }

                list.innerHTML = html;

                const refundBtn = document.getElementById('btn-refund-research');
                if (refundBtn) refundBtn.addEventListener('click', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    if (confirm('Are you sure you want to refund all research upgrades? 100% of your Cosmic Data will be returned.')) {
                        refundResearch();
                    }
                });

                document.querySelectorAll('.research-btn').forEach(btn => {
                    btn.addEventListener('pointerdown', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (btn.hasAttribute('disabled')) return;
                        
                        const key = btn.getAttribute('data-research');
                        const cost = parseInt(btn.getAttribute('data-cost'), 10);
                        const currentLvl = state.research[key] || 0;
                        if (state.cosmicData >= cost && currentLvl < 10) {
                            state.cosmicData -= cost; state.research[key] = currentLvl + 1; saveSettings(); updateResearchUI(); playSynthSound('upgrade');
                        } else {
                            if (currentLvl < 10) showGameNotice('<i class="fa-solid fa-triangle-exclamation mr-1"></i> Not enough Cosmic Data', 2000);
                            playSynthSound('hit');
                        }
                    });
                });
            } catch (e) { console.warn("Error updating research UI", e); }
        }

        function scrollEncyclopediaTo(sectionKey) {
            const scrollBody = document.getElementById('encyclopedia-scroll-body');
            const section = document.getElementById(`encyclopedia-section-${sectionKey}`);
            if (!scrollBody || !section) return;
            scrollBody.scrollTo({
                top: section.offsetTop - scrollBody.offsetTop,
                behavior: 'smooth'
            });
        }


        // ----------------------------------------------------------------------
        // 2. UTILS
        // ----------------------------------------------------------------------
        function bindButton(id, handler) {
            const btn = document.getElementById(id);
            if (!btn) return;
            const activeHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                handler(e);
            };
            btn.addEventListener('pointerdown', activeHandler);
        }

        function bindDismissButton(buttonId, dismissFn) {
            bindButton(buttonId, dismissFn);
        }

        function getPointerCoords(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
            const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
            return { x: clientX - rect.left, y: clientY - rect.top };
        }

        // ----------------------------------------------------------------------
        // 3. CANVAS & COSMIC BACKGROUND
        // ----------------------------------------------------------------------
        function getViewportSize() {
            const width = Math.round(canvas.clientWidth || document.documentElement.clientWidth || window.innerWidth);
            const height = Math.round(canvas.clientHeight || document.documentElement.clientHeight || window.innerHeight);
            return { width, height };
        }

        function resizeCanvas() {
            const viewportSize = getViewportSize();
            const actualWidth = viewportSize.width;
            const actualHeight = viewportSize.height;
            if (actualWidth <= 0 || actualHeight <= 0) return;
            if (canvas.width === actualWidth && canvas.height === actualHeight) return;

            canvas.width = actualWidth;
            canvas.height = actualHeight;

            const minDim = Math.min(canvas.width, canvas.height);
            state.gameScale = Math.max(0.5, Math.min(0.9, minDim / 640));
            state.rangeScale = Math.max(0.7, Math.min(1.05, minDim / 560));

            state.EARTH_RADIUS = Math.floor(62 * state.gameScale);
            state.ORBIT_PATHS = BASE_ORBIT_PATHS.map(p => Math.floor(p * state.gameScale));

            if (state.game && state.game.towers) {
                for (let tower of state.game.towers) tower.updateCoordinates();
            }
        }

        function scheduleResizeCanvas() {
            if (state.resizeRaf) return;
            state.resizeRaf = requestAnimationFrame(() => {
                state.resizeRaf = null;
                resizeCanvas();
            });
        }

        const resizeObserver = new ResizeObserver(() => scheduleResizeCanvas());
        resizeObserver.observe(canvas);
        window.addEventListener('resize', scheduleResizeCanvas);
        window.addEventListener('orientationchange', () => setTimeout(scheduleResizeCanvas, 250));
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', scheduleResizeCanvas);
        }
        resizeCanvas();

        function updateCosmicBackground(isWarping, speedMultiplier = 1) {
            const w = canvas.width;
            const h = canvas.height;
            if (!updateCosmicBackground.stars || updateCosmicBackground.lastW !== w || updateCosmicBackground.lastH !== h) {
                const starCount = Math.max(80, Math.min(220, Math.floor((w * h) / 7000)));
                updateCosmicBackground.stars = Array.from({ length: starCount }, () => ({
                    x: Math.random() * w, y: Math.random() * h,
                    r: Math.random() * 1.4 + 0.25, alpha: Math.random() * 0.7 + 0.25,
                    twinkle: Math.random() * Math.PI * 2, speed: Math.random() * 0.15 + 0.03
                }));
                updateCosmicBackground.lastW = w;
                updateCosmicBackground.lastH = h;
            }
            const speedMult = isWarping ? 8 : 1 * speedMultiplier;
            for (const star of updateCosmicBackground.stars) {
                star.y += star.speed * speedMult;
                if (star.y > h) { star.y = 0; star.x = Math.random() * w; }
            }
        }

        function drawCosmicBackgroundOnly(isWarping) {
            const w = canvas.width;
            const h = canvas.height;

            ctx.save();
            const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75);
            gradient.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
            gradient.addColorStop(0.45, 'rgba(15, 23, 42, 0.10)');
            gradient.addColorStop(1, 'rgba(3, 7, 18, 0.35)');
            ctx.fillStyle = gradient;
            ctx.fillRect(-30, -30, w + 60, h + 60);

            const time = Date.now() * 0.002;
            for (const star of updateCosmicBackground.stars || []) {
                const flicker = 0.55 + Math.sin(time + star.twinkle) * 0.25;
                ctx.globalAlpha = star.alpha * flicker;
                ctx.fillStyle = '#e0f2fe';
                if (isWarping) {
                    ctx.fillRect(star.x, star.y, Math.max(1, star.r * 1.5), star.r * 15);
                } else {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.globalAlpha = 1;
            ctx.restore();
        }

        function setBootLoaderProgress(loaded, total, status = 'Loading command assets') {
            const progress = total > 0 ? Math.round((loaded / total) * 100) : 100;
            const loader = document.getElementById('boot-loader');
            const statusEl = document.getElementById('boot-loader-status');
            const countEl = document.getElementById('boot-loader-count');
            if (loader) loader.style.setProperty('--load-progress', `${progress}%`);
            if (statusEl) statusEl.innerText = status;
            if (countEl) countEl.innerText = `${progress}%`;
        }

        function preloadImageAsset(url) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(url);
                img.onerror = () => reject(new Error(`Image failed: ${url}`));
                img.src = url;
            });
        }

        function preloadAudioAsset(url) {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                let settled = false;
                const finish = () => {
                    if (settled) return;
                    settled = true;
                    audio.removeEventListener('canplaythrough', finish);
                    audio.removeEventListener('loadeddata', finish);
                    audio.removeEventListener('error', fail);
                    resolve(url);
                };
                const fail = () => {
                    if (settled) return;
                    settled = true;
                    reject(new Error(`Audio failed: ${url}`));
                };
                audio.preload = 'auto';
                audio.addEventListener('canplaythrough', finish, { once: true });
                audio.addEventListener('loadeddata', finish, { once: true });
                audio.addEventListener('error', fail, { once: true });
                audio.src = url;
                audio.load();
                setTimeout(finish, 6500);
            });
        }

        function preloadAsset(url) {
            if (/\.(mp3|m4a|ogg|wav)$/i.test(url)) return preloadAudioAsset(url);
            return preloadImageAsset(url);
        }

        async function preloadGameAssets() {
            const total = PRELOAD_ASSET_URLS.length;
            let loaded = 0;
            setBootLoaderProgress(0, total);
            const results = await Promise.all(PRELOAD_ASSET_URLS.map(url =>
                preloadAsset(url)
                    .then(() => ({ url, ok: true }))
                    .catch(error => ({ url, ok: false, error }))
                    .finally(() => {
                        loaded++;
                        setBootLoaderProgress(loaded, total);
                    })
            ));
            const failed = results.filter(result => !result.ok);
            if (failed.length > 0) {
                console.warn('Asset preload failures:', failed);
            }
        }

        function hideBootLoader() {
            const loader = document.getElementById('boot-loader');
            if (!loader) return;
            loader.classList.add('boot-loader-hidden');
            setTimeout(() => loader.classList.add('hidden'), 400);
        }

        function showBootLoaderFailure(error) {
            const statusEl = document.getElementById('boot-loader-status');
            const retryBtn = document.getElementById('boot-loader-retry');
            if (statusEl) statusEl.innerText = 'Asset loading failed. Check files and retry.';
            if (retryBtn) retryBtn.classList.remove('hidden');
            console.warn('Boot preload failed:', error);
        }

        async function bootGame() {
            const retryBtn = document.getElementById('boot-loader-retry');
            if (retryBtn) retryBtn.classList.add('hidden');
            try {
                setBootLoaderProgress(0, PRELOAD_ASSET_URLS.length, 'Loading command assets');
                await preloadGameAssets();
                setBootLoaderProgress(PRELOAD_ASSET_URLS.length, PRELOAD_ASSET_URLS.length, 'Command assets ready');
                hideBootLoader();
                startTitleBgm();
                if (!state.gameLoopStarted) {
                    state.gameLoopStarted = true;
                    loop();
                }
            } catch (error) {
                console.warn('Boot preload failed; continuing to title screen:', error);
                hideBootLoader();
                startTitleBgm();
                if (!state.gameLoopStarted) {
                    state.gameLoopStarted = true;
                    loop();
                }
            }
        }

        // ----------------------------------------------------------------------
        // 4. AUDIO
        // ----------------------------------------------------------------------
        function initAudio() {
            if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            getBgmAudio();
        }

        function getBgmAudio() {
            if (!state.bgmAudio) {
                state.bgmAudio = new Audio();
                state.bgmAudio.loop = true;
                state.bgmAudio.preload = 'auto';
                state.bgmAudio.playsInline = true;
            }
            return state.bgmAudio;
        }

        function pauseBgm() {
            if (state.bgmAudio) state.bgmAudio.pause();
        }

        function canPlayBgm() {
            return state.isBgmEnabled && (!state.game || !state.game.paused);
        }

        function bindBgmUnlockFallback() {
            if (state.bgmUnlockListenerBound) return;
            state.bgmUnlockListenerBound = true;
            const unlockBgm = () => {
                state.bgmUnlockListenerBound = false;
                document.removeEventListener('pointerdown', unlockBgm);
                document.removeEventListener('touchstart', unlockBgm);
                document.removeEventListener('keydown', unlockBgm);
                if (state.isBgmEnabled) {
                    initAudio();
                    switchBgm(state.activeBgmKey);
                }
            };
            document.addEventListener('pointerdown', unlockBgm, { once: true });
            document.addEventListener('touchstart', unlockBgm, { once: true });
            document.addEventListener('keydown', unlockBgm, { once: true });
        }

        function switchBgm(trackKey) {
            const track = BGM_TRACKS[trackKey] || BGM_TRACKS.default;
            state.activeBgmKey = BGM_TRACKS[trackKey] ? trackKey : 'default';
            const audio = getBgmAudio();
            audio.volume = track.volume * state.bgmVolume;

            if (audio.dataset.trackKey !== state.activeBgmKey) {
                audio.dataset.trackKey = state.activeBgmKey;
                audio.src = track.src;
                audio.currentTime = 0;
                audio.load();
            }

            if (!canPlayBgm()) {
                pauseBgm();
                return;
            }

            audio.play().catch(() => bindBgmUnlockFallback());
        }

        function syncBgm() {
            if (!canPlayBgm()) {
                pauseBgm();
                return;
            }
            switchBgm(state.activeBgmKey);
        }

        function startTitleBgm() {
            state.activeBgmKey = 'default';
            switchBgm('default');
        }

        function syncAudioUI() {
            const sfxToggle = document.getElementById('settings-sfx-toggle');
            const bgmToggle = document.getElementById('settings-bgm-toggle');
            const sfxVol = document.getElementById('settings-sfx-volume');
            const bgmVol = document.getElementById('settings-bgm-volume');
            const devModeCheckbox = document.getElementById('settings-dev-mode');
            if (sfxToggle) sfxToggle.checked = state.isSfxEnabled;
            if (bgmToggle) bgmToggle.checked = state.isBgmEnabled;
            if (sfxVol) sfxVol.value = state.sfxVolume;
            if (bgmVol) bgmVol.value = state.bgmVolume;
            if (devModeCheckbox) devModeCheckbox.checked = state.isDevMode;

            const pSfxToggle = document.getElementById('pause-settings-sfx-toggle');
            const pBgmToggle = document.getElementById('pause-settings-bgm-toggle');
            const pSfxVol = document.getElementById('pause-settings-sfx-volume');
            const pBgmVol = document.getElementById('pause-settings-bgm-volume');
            if (pSfxToggle) pSfxToggle.checked = state.isSfxEnabled;
            if (pBgmToggle) pBgmToggle.checked = state.isBgmEnabled;
            if (pSfxVol) pSfxVol.value = state.sfxVolume;
            if (pBgmVol) pBgmVol.value = state.bgmVolume;
        }

        function syncScanlineUI() {
            document.body.classList.toggle('scanline', state.isScanlinesEnabled);
            const toggle = document.getElementById('settings-scanlines-toggle-new');
            if (toggle) toggle.checked = state.isScanlinesEnabled;
            const pToggle = document.getElementById('pause-settings-scanlines-toggle-new');
            if (pToggle) pToggle.checked = state.isScanlinesEnabled;

            const shake = document.getElementById('settings-shake-intensity');
            if (shake) shake.value = state.screenShakeIntensity;
            const pShake = document.getElementById('pause-settings-shake-intensity');
            if (pShake) pShake.value = state.screenShakeIntensity;
        }

        function toggleMasterAudio() {
            const isMuted = !state.isSfxEnabled && !state.isBgmEnabled;
            state.isSfxEnabled = isMuted;
            state.isBgmEnabled = isMuted;
            if (state.isSfxEnabled || state.isBgmEnabled) initAudio();
            saveSettings();
            loadSettings();
        }

        function toggleScanlineState() {
            state.isScanlinesEnabled = !state.isScanlinesEnabled;
            syncScanlineUI();
        }

        function isIosDevice() {
            return /iphone|ipad|ipod/i.test(navigator.userAgent);
        }

        function isStandaloneDisplay() {
            return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        }

        function syncInstallUI() {
            const installBtn = document.getElementById('android-install-btn');
            const statusLabel = document.getElementById('install-status-label');
            if (!installBtn || !statusLabel) return;

            if (isStandaloneDisplay()) {
                installBtn.disabled = true;
                installBtn.className = "w-full bg-slate-800 text-slate-500 cursor-not-allowed font-black py-2.5 rounded-xl text-xs tracking-widest uppercase min-h-[40px] select-none pointer-events-auto";
                installBtn.innerText = "APP IS INSTALLED";
                statusLabel.innerText = "Running in app mode";
            } else if (isIosDevice()) {
                installBtn.disabled = true;
                installBtn.className = "w-full bg-slate-800 text-slate-500 cursor-not-allowed font-black py-2.5 rounded-xl text-xs tracking-widest uppercase min-h-[40px] select-none pointer-events-auto";
                installBtn.innerText = "USE SAFARI SHARE MENU";
                statusLabel.innerText = "Use iPhone instructions below";
            } else if (state.deferredInstallPrompt) {
                installBtn.disabled = false;
                installBtn.className = "w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black py-2.5 rounded-xl text-xs tracking-widest uppercase min-h-[40px] select-none pointer-events-auto";
                installBtn.innerText = "INSTALL ON ANDROID";
                statusLabel.innerText = "Android install prompt ready";
            } else {
                installBtn.disabled = true;
                installBtn.className = "w-full bg-slate-800 text-slate-500 cursor-not-allowed font-black py-2.5 rounded-xl text-xs tracking-widest uppercase min-h-[40px] select-none pointer-events-auto";
                installBtn.innerText = "INSTALL UNAVAILABLE";
                statusLabel.innerText = "Use Chrome over HTTPS or localhost";
            }
        }

        function canUsePwaFeatures() {
            return location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        }

        function attachPwaManifest() {
            if (!canUsePwaFeatures() || document.querySelector('link[rel="manifest"]')) return;
            const manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = 'manifest.webmanifest';
            document.head.appendChild(manifestLink);
        }


        async function applyAppUpdate() {
            if (state.swRegistration) await state.swRegistration.update();
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHES' });
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
            setTimeout(() => window.location.reload(), 100);
        }

        async function checkForAppUpdate(registration, forceApply = false) {
            if (!canUsePwaFeatures()) return false;
            if (registration) state.swRegistration = registration;
            try {
                const response = await fetch(`./version.json?ts=${Date.now()}`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (!response.ok) return false;

                const data = await response.json();
                if (!data.version || data.version === APP_VERSION) return false;

                // If the state.game is actively running and not forced, set a flag and apply the update later
                if (!forceApply && state.game && state.game.running) {
                    state.pendingAppUpdate = true;
                    return true;
                }

                applyAppUpdate();
                return true;
            } catch (error) {
                console.warn('App update check failed:', error);
                return false;
            }
        }

        function checkPendingUpdates() {
            if (state.pendingAppUpdate) applyAppUpdate();
        }

        function registerPwaSupport() {
            attachPwaManifest();
            if ('serviceWorker' in navigator && canUsePwaFeatures()) {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        registration.update();
                        checkForAppUpdate(registration);
                        setInterval(() => {
                            registration.update();
                            checkForAppUpdate(registration);
                        }, 5 * 60 * 1000);
                    })
                    .catch(error => console.warn('Service worker registration failed:', error));

                let refreshingAfterUpdate = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (refreshingAfterUpdate) return;
                    refreshingAfterUpdate = true;
                    setTimeout(() => window.location.reload(), 100);
                });

                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        navigator.serviceWorker.getRegistration().then(registration => checkForAppUpdate(registration));
                    }
                });
            }

            window.addEventListener('beforeinstallprompt', (event) => {
                event.preventDefault();
                state.deferredInstallPrompt = event;
                syncInstallUI();
            });

            window.addEventListener('appinstalled', () => {
                state.deferredInstallPrompt = null;
                syncInstallUI();
            });
        }

        async function triggerAndroidInstall() {
            if (!state.deferredInstallPrompt) {
                syncInstallUI();
                return;
            }

            state.deferredInstallPrompt.prompt();
            await state.deferredInstallPrompt.userChoice;
            state.deferredInstallPrompt = null;
            syncInstallUI();
        }

        function triggerCheckUpdate() {
            const btn = document.getElementById('check-update-btn');
            if (!btn) return;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> CHECKING...';
            btn.disabled = true;

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistration().then(registration => {
                    if (registration) {
                        checkForAppUpdate(registration, true).then(hasUpdate => {
                            setTimeout(() => {
                                btn.innerHTML = originalText;
                                btn.disabled = false;
                                if (!hasUpdate) {
                                    showGameNotice('You are already on the latest version.', 2500);
                                } else {
                                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> RESTARTING...';
                                    btn.disabled = true;
                                }
                            }, 800);
                        });
                    } else {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                        showGameNotice('Service worker not registered.', 2500);
                    }
                }).catch(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
            } else {
                btn.innerHTML = originalText;
                btn.disabled = false;
                showGameNotice('Updates not supported in this browser.', 2500);
            }
        }

        function playSynthSound(type) {
            if (!state.isSfxEnabled || !state.audioCtx) return;
            try {
                if (state.audioCtx.state === 'suspended') state.audioCtx.resume();

                const masterSfxGain = state.audioCtx.createGain();
                masterSfxGain.gain.value = state.sfxVolume;
                masterSfxGain.connect(state.audioCtx.destination);

                const osc = state.audioCtx.createOscillator();
                const gain = state.audioCtx.createGain();
                osc.connect(gain); gain.connect(masterSfxGain);
                const now = state.audioCtx.currentTime;

                if (type === 'laser' || type === 'lasersentry') {
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
                    gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now); osc.stop(now + 0.15);
                } else if (type === 'plasma') {
                    osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
                    gain.gain.setValueAtTime(0.25, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now); osc.stop(now + 0.3);
                } else if (type === 'missile') {
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.linearRampToValueAtTime(600, now + 0.4);
                    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    osc.start(now); osc.stop(now + 0.4);
                } else if (type === 'railgun') {
                    osc.type = 'sine'; osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
                    gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                    const bufferSize = state.audioCtx.sampleRate * 0.2; const buffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
                    const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                    const noise = state.audioCtx.createBufferSource(); noise.buffer = buffer;
                    const noiseGain = state.audioCtx.createGain(); noiseGain.gain.setValueAtTime(0.15, now); noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    noise.connect(noiseGain); noiseGain.connect(masterSfxGain);
                    noise.start(now); noise.stop(now + 0.2);
                    osc.start(now); osc.stop(now + 0.5);
                } else if (type === 'lightningsentry') {
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(1500, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                    gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now); osc.stop(now + 0.2);
                } else if (type === 'magnetsentry') {
                    osc.type = 'sine'; osc.frequency.setValueAtTime(120, now); osc.frequency.linearRampToValueAtTime(50, now + 0.35);
                    gain.gain.setValueAtTime(0.25, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                    osc.start(now); osc.stop(now + 0.35);
                } else if (type === 'hit') {
                    osc.type = 'triangle'; osc.frequency.setValueAtTime(120, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.1);
                    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1);
                } else if (type === 'explosion') {
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.6);
                    gain.gain.setValueAtTime(0.35, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                    const bufferSize = state.audioCtx.sampleRate * 0.6; const buffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
                    const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                    const noise = state.audioCtx.createBufferSource(); noise.buffer = buffer;
                    const noiseGain = state.audioCtx.createGain(); noiseGain.gain.setValueAtTime(0.3, now); noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                    noise.connect(noiseGain); noiseGain.connect(masterSfxGain);
                    noise.start(now); noise.stop(now + 0.6);
                    osc.start(now); osc.stop(now + 0.6);
                } else if (type === 'shield_deflect') {
                    osc.type = 'sine'; osc.frequency.setValueAtTime(500, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                    osc.start(now); osc.stop(now + 0.25);
                } else if (type === 'upgrade') {
                    osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); osc.frequency.setValueAtTime(450, now + 0.08); osc.frequency.setValueAtTime(600, now + 0.16);
                    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now); osc.stop(now + 0.3);
                } else if (type === 'earth_hit') {
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(60, now); osc.frequency.linearRampToValueAtTime(30, now + 0.8);
                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                    osc.start(now); osc.stop(now + 0.8);
                } else if (type === 'select_tower') {
                    osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                    gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now); osc.stop(now + 0.1);
                } else if (type === 'wave_start') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(330, now);
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.14);
                    osc.frequency.setValueAtTime(440, now + 0.15);
                    gain.gain.setValueAtTime(0.2, now + 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                    osc.start(now); osc.stop(now + 0.6);
                } else if (type === 'wave_clear') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(440, now); gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.14);
                    osc.frequency.setValueAtTime(554, now + 0.15); gain.gain.setValueAtTime(0.2, now + 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.29);
                    osc.frequency.setValueAtTime(659, now + 0.30); gain.gain.setValueAtTime(0.2, now + 0.30);
                    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.44);
                    osc.frequency.setValueAtTime(880, now + 0.45); gain.gain.setValueAtTime(0.2, now + 0.45);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
                    osc.start(now); osc.stop(now + 1.2);
                } else if (type === 'rock_destroy') {
                    osc.type = 'square'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
                    gain.gain.setValueAtTime(0.25, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    const bufferSize = state.audioCtx.sampleRate * 0.2; const buffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
                    const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                    const noise = state.audioCtx.createBufferSource(); noise.buffer = buffer;
                    const noiseGain = state.audioCtx.createGain(); noiseGain.gain.setValueAtTime(0.3, now); noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    noise.connect(noiseGain); noiseGain.connect(masterSfxGain);
                    noise.start(now); noise.stop(now + 0.2);
                    osc.start(now); osc.stop(now + 0.2);
                } else if (type === 'ship_destroy') {
                    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                    gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    const bufferSize = state.audioCtx.sampleRate * 0.3; const buffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
                    const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                    const noise = state.audioCtx.createBufferSource(); noise.buffer = buffer;
                    const noiseGain = state.audioCtx.createGain(); noiseGain.gain.setValueAtTime(0.2, now); noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    noise.connect(noiseGain); noiseGain.connect(masterSfxGain);
                    noise.start(now); noise.stop(now + 0.3);
                    osc.start(now); osc.stop(now + 0.3);
                } else if (type === 'warning') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.setValueAtTime(400, now + 0.2);
                    osc.frequency.setValueAtTime(600, now + 0.4);
                    osc.frequency.setValueAtTime(400, now + 0.6);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.8);
                    osc.start(now); osc.stop(now + 0.8);
                }
            } catch (e) { console.warn('Audio Context error: ', e); }
        }

        // ----------------------------------------------------------------------
        // 5. UI CONTROLLERS
        // ----------------------------------------------------------------------
        function closeInspector() {
            const p = document.getElementById('inspector-panel');
            if (!p) return;
            if (window.innerWidth < 768) p.style.transform = 'translate(0px, 120%)'; else p.style.transform = 'translate(120%, 0px)';
            if (state.game) state.game.selectedTower = null;
            setTimeout(() => { if (state.game && !state.game.selectedTower) p.classList.add('hidden'); }, 300);
        }

        function closeOrbitInspector() {
            const p = document.getElementById('orbit-inspector-panel');
            if (!p) return;
            finishMasterCommandTour();
            if (window.innerWidth < 768) p.style.transform = 'translate(0px, 120%)'; else p.style.transform = 'translate(120%, 0px)';
            if (state.game) state.game.selectedOrbitIndex = null;
            setTimeout(() => { if (state.game && state.game.selectedOrbitIndex === null) p.classList.add('hidden'); }, 300);
        }

        function updateBlueprintOverlay() {
            const overlay = document.getElementById('blueprint-empty-slots-overlay');
            if (overlay) {
                if (hasEmptyDeployableOrbitSlot()) {
                    overlay.classList.add('hidden');
                } else {
                    overlay.classList.remove('hidden');
                }
            }
        }

        function closeBlueprintDrawer() {
            const p = document.getElementById('blueprint-panel');
            if (!p) return;
            if (window.innerWidth < 768) p.style.transform = 'translate(0px, 120%)'; else p.style.transform = 'translate(120%, 0px)';
            setTimeout(() => { if (p.style.transform !== 'translate(0px, 0px)') p.classList.add('hidden'); }, 300);
        }

        function openBlueprintDrawer(playSound = true) {
            closeInspector(); closeOrbitInspector();
            const p = document.getElementById('blueprint-panel');
            if (p) { p.classList.remove('hidden'); p.offsetHeight; p.style.transform = 'translate(0px, 0px)'; if (playSound) playSynthSound('upgrade'); }
            updateBlueprintOverlay();
        }

        function toggleBlueprintDrawer() {
            const p = document.getElementById('blueprint-panel');
            if (p) { if (p.classList.contains('hidden') || p.style.transform.includes('120%')) openBlueprintDrawer(); else closeBlueprintDrawer(); }
        }

        function openOrbitInspector() {
            const p = document.getElementById('orbit-inspector-panel');
            if (p) { p.classList.remove('hidden'); p.offsetHeight; p.style.transform = 'translate(0px, 0px)'; }
        }

        function toggleOrbitInspector() {
            closeInspector(); closeBlueprintDrawer();
            const p = document.getElementById('orbit-inspector-panel');
            if (p && p.classList.contains('hidden')) { updateOrbitInspectorUI(); openOrbitInspector(); maybeStartMasterCommandTour(); } else { closeOrbitInspector(); }
            playSynthSound('upgrade');
        }

        const MASTER_COMMAND_TOUR_STEPS = [
            {
                targetId: 'master-tour-shield',
                title: 'Shield Engineering',
                text: 'Repair depleted shields or expand maximum shield capacity when you have enough credits.'
            },
            {
                targetId: 'master-tour-orbits',
                title: 'Orbital Array Control',
                text: 'Unlock additional orbit paths and expand slot capacity so more satellites can be deployed.'
            },
            {
                targetId: 'master-tour-directives',
                title: 'Command Directives',
                text: 'Boss rewards appear here. Directives are persistent upgrades that affect future defense waves.'
            }
        ];

        function maybeStartMasterCommandTour() {
            if (state.masterCommandTourSeen) return;
            state.masterCommandTourSeen = true;
            setTimeout(() => startMasterCommandTour(), 360);
        }

        function startMasterCommandTour() {
            state.masterCommandTourStep = 0;
            renderMasterCommandTour();
        }

        function clearMasterCommandTourFocus() {
            document.querySelectorAll('.master-command-tour-focus').forEach(el => el.classList.remove('master-command-tour-focus'));
        }

        function finishMasterCommandTour() {
            clearMasterCommandTourFocus();
            const card = document.getElementById('master-command-tour');
            if (card) card.classList.add('hidden');
        }

        function renderMasterCommandTour() {
            const card = document.getElementById('master-command-tour');
            const stepLabel = document.getElementById('master-command-tour-step');
            const title = document.getElementById('master-command-tour-title');
            const text = document.getElementById('master-command-tour-text');
            const next = document.getElementById('master-command-tour-next');
            const step = MASTER_COMMAND_TOUR_STEPS[state.masterCommandTourStep];
            const target = step ? document.getElementById(step.targetId) : null;
            if (!card || !step || !target) {
                finishMasterCommandTour();
                return;
            }

            clearMasterCommandTourFocus();
            target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            target.classList.add('master-command-tour-focus');
            if (stepLabel) stepLabel.innerText = `${String(state.masterCommandTourStep + 1).padStart(2, '0')}/${String(MASTER_COMMAND_TOUR_STEPS.length).padStart(2, '0')}`;
            if (title) title.innerText = step.title;
            if (text) text.innerText = step.text;
            if (next) next.innerText = state.masterCommandTourStep === MASTER_COMMAND_TOUR_STEPS.length - 1 ? 'Done' : 'Next';

            const rect = target.getBoundingClientRect();
            const cardWidth = Math.min(320, window.innerWidth - 24);
            const left = Math.max(12, Math.min(window.innerWidth - cardWidth - 12, rect.left + rect.width / 2 - cardWidth / 2));
            const placeBelow = rect.bottom + 130 < window.innerHeight;
            const top = placeBelow ? rect.bottom + 10 : Math.max(12, rect.top - 142);
            card.style.width = `${cardWidth}px`;
            card.style.left = `${left}px`;
            card.style.top = `${top}px`;
            card.classList.remove('hidden');
        }

        function formatBonusPercent(value, invert = false) {
            if (!value) return null;
            const adjusted = invert ? -value : value;
            const sign = adjusted > 0 ? '+' : '';
            return `${sign}${Math.round(adjusted * 100)}%`;
        }

        function getSatelliteBonusSummary(tower) {
            if (!tower) return [];
            const bonuses = [];
            const addPercent = (label, value, invert = false) => {
                const formatted = formatBonusPercent(value, invert);
                if (formatted) bonuses.push(`${label} ${formatted}`);
            };

            addPercent('All damage', getDirectiveEffectValue('damage', 0));
            addPercent('All fire rate', getDirectiveEffectValue('fireRate', 0));
            addPercent('All range', getDirectiveEffectValue('range', 0));
            addPercent('Satellite HP', getDirectiveEffectValue('satelliteHp', 0));
            if (tower.orbitIndex === 0) addPercent('Inner orbit fire rate', getDirectiveEffectValue('innerRate', 0));
            if (tower.orbitIndex === 1) addPercent('Middle orbit damage', getDirectiveEffectValue('middleDamage', 0));
            if (tower.orbitIndex === 2) addPercent('Outer orbit range', getDirectiveEffectValue('outerRange', 0));

            if (tower.type === 'laser') addPercent('Turret damage', getDirectiveEffectValue('laserDamage', 0));
            if (tower.type === 'plasma') addPercent('Plasma damage', getDirectiveEffectValue('plasmaDamage', 0));
            if (tower.type === 'railgun') addPercent('Railgun damage', getDirectiveEffectValue('railgunDamage', 0));
            if (tower.type === 'magnetsentry') {
                const magnetTradeoff = getDirectiveEffectValue('magnetTradeoff');
                if (magnetTradeoff) bonuses.push(`Magnet slow to ${Math.round(magnetTradeoff.slow * 100)}% speed`);
            }
            if (tower.type === 'lightningsentry') {
                const chains = getDirectiveEffectValue('lightningChains', 0);
                if (chains) bonuses.push(`Lightning chains +${chains}`);
            }

            const glass = getDirectiveEffectValue('glassCannon');
            if (glass) bonuses.push(`Glass Cannon +${Math.round(glass.dmg * 100)}% damage, -${Math.round(glass.hp * 100)}% HP`);
            const rangeTradeoff = getDirectiveEffectValue('rangeDamageTradeoff');
            if (rangeTradeoff) bonuses.push(`Range priority +${Math.round(rangeTradeoff.range * 100)}% range, -${Math.round(rangeTradeoff.dmg * 100)}% damage`);
            const corePowered = getDirectiveEffectValue('corePowered');
            if (corePowered) bonuses.push(`Core powered +${Math.round(corePowered.dmg * 100)}% damage, +${Math.round(corePowered.rate * 100)}% fire rate`);
            const shieldWeapon = getDirectiveEffectValue('shieldWeapon');
            if (shieldWeapon) bonuses.push(`Shield coupling +${Math.round(shieldWeapon.dmg * 100)}% damage`);
            const finalStand = getDirectiveEffectValue('finalStand');
            if (finalStand) bonuses.push('Final Stand damage shifts with core integrity');
            const overdrive = getDirectiveEffectValue('overdriveRepair');
            if (overdrive) bonuses.push(`Overdrive +${Math.round(overdrive.rate * 100)}% fire rate, repairs cost more`);

            return bonuses;
        }

        function renderSatelliteBonusList(tower) {
            const bonusList = document.getElementById('inspect-bonus-list');
            if (!bonusList) return;
            const bonuses = getSatelliteBonusSummary(tower);
            if (!bonuses.length) {
                bonusList.innerHTML = '<span class="text-slate-500">No active directive bonuses.</span>';
                return;
            }
            bonusList.innerHTML = bonuses.map(bonus => `<span class="bg-slate-900 border border-sky-500/20 rounded px-1.5 py-0.5">${bonus}</span>`).join('');
        }

        function formatSignedNumber(value, suffix = '', invertSignForZero = false) {
            const rounded = Number.isInteger(value) ? value : Number(value.toFixed(2));
            if (rounded === 0) return `${invertSignForZero ? '-0' : '+0'}${suffix}`;
            return `${rounded > 0 ? '+' : ''}${rounded}${suffix}`;
        }

        function formatStatWithBonus(baseValue, effectiveValue, suffix = '', lowerIsBetter = false) {
            const delta = effectiveValue - baseValue;
            const isGood = lowerIsBetter ? delta <= 0 : delta >= 0;
            return `${baseValue}${suffix} <span class="${isGood ? 'text-emerald-300' : 'text-red-300'}">(${formatSignedNumber(delta, suffix, lowerIsBetter)})</span>`;
        }

        function cycleSelectedSatellite(direction) {
            if (!state.game || !state.game.selectedTower) return;
            const currentOrbit = state.game.selectedTower.orbitIndex;
            const orbitTowers = state.game.towers.filter(t => t.orbitIndex === currentOrbit).sort((a, b) => a.slotIndex - b.slotIndex);

            if (orbitTowers.length <= 1) return;

            const currentIndex = orbitTowers.findIndex(t => t.id === state.game.selectedTower.id);
            const nextIndex = (currentIndex + direction + orbitTowers.length) % orbitTowers.length;

            playSynthSound('hit');
            selectTower(orbitTowers[nextIndex]);
        }

        function selectTower(tower) {
            closeOrbitInspector(); closeBlueprintDrawer();
            if (state.game) state.game.selectedTower = tower;
            if (tower) {
                const iTitle = document.getElementById('inspect-title');
                if (iTitle) { iTitle.innerText = SATELLITE_CONFIGS[tower.type].name; iTitle.style.color = SATELLITE_CONFIGS[tower.type].color; }
                const hpEl = document.getElementById('inspect-hp');
                const hpBar = document.getElementById('inspect-hp-bar');
                if (hpEl) hpEl.innerText = `${Math.max(0, Math.ceil(tower.hp))} / ${tower.maxHp}`;
                if (hpBar) hpBar.style.width = `${Math.max(0, tower.hp / tower.maxHp) * 100}%`;
                const repairBtn = document.getElementById('btn-repair-sat');
                const repairCostEl = document.getElementById('cost-repair-sat');
                const repairCost = getSatelliteRepairCost(tower);
                if (repairCostEl) {
                    const baseRepairCost = Math.ceil(Math.max(0, tower.maxHp - tower.hp) * 1.5);
                    let repairText = baseRepairCost > 0 ? `<i class="fa-solid fa-coins"></i> ${baseRepairCost}` : 'FULL';
                    if (baseRepairCost > 0) {
                        const repairDiff = repairCost - baseRepairCost;
                        if (repairDiff !== 0) {
                            const sign = repairDiff > 0 ? '+' : '';
                            const canAfford = state.game.gold >= repairCost;
                            const colorClass = repairDiff > 0 ? (canAfford ? 'text-red-900' : 'text-red-400') : (canAfford ? 'text-emerald-900' : 'text-emerald-400');
                            repairText += ` <span class="text-[8px] ${colorClass} ml-0.5">(${sign}${repairDiff})</span>`;
                        }
                    }
                    repairCostEl.innerHTML = repairText;
                }
                if (repairBtn) {
                    if (repairCost <= 0 || state.game.gold < repairCost) {
                        repairBtn.disabled = true;
                        repairBtn.className = "w-full mt-2 bg-slate-800 text-slate-500 cursor-not-allowed font-black py-1.5 rounded text-[10px] flex items-center justify-center gap-1 select-none";
                    } else {
                        repairBtn.disabled = false;
                        repairBtn.className = "w-full mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-1.5 rounded text-[10px] flex items-center justify-center gap-1 select-none";
                    }
                }
                const salvageValue = document.getElementById('salvage-value');
                if (salvageValue) {
                    const salvageFinal = getSatelliteSalvageValue(tower);
                    const baseSalvage = Math.floor((tower.investedGold || SATELLITE_CONFIGS[tower.type].cost) * 0.25);
                    const salvageDiff = salvageFinal - baseSalvage;
                    let salvageText = `<i class="fa-solid fa-coins"></i> ${baseSalvage}`;
                    if (salvageDiff !== 0) {
                        const sign = salvageDiff > 0 ? '+' : '';
                        const colorClass = salvageDiff > 0 ? 'text-emerald-400' : 'text-red-400';
                        salvageText += ` <span class="text-[8px] ${colorClass} ml-0.5">(${sign}${salvageDiff})</span>`;
                    }
                    salvageValue.innerHTML = salvageText;
                }

                const level = tower.level || 1;
                const dmgEl = document.getElementById('inspect-dmg');
                const rateEl = document.getElementById('inspect-rate');
                const rngEl = document.getElementById('inspect-rng');
                const satLvlEl = document.getElementById('inspect-sat-lvl');
                const satDotsEl = document.getElementById('sat-lvl-dots');
                const upgradeBtn = document.getElementById('btn-upgrade-sat');
                const upgradeCostEl = document.getElementById('cost-upgrade-sat');

                if (dmgEl) dmgEl.innerHTML = formatStatWithBonus(tower.damage, tower.effectiveDamage);
                if (rateEl) {
                    const baseRate = Number((tower.baseFireRateCooldown / 60).toFixed(2));
                    const effectiveRate = Number((tower.fireRateCooldown / 60).toFixed(2));
                    rateEl.innerHTML = formatStatWithBonus(baseRate, effectiveRate, '', true);
                }
                if (rngEl) {
                    const baseRange = Math.round(tower.upgradedRange / state.rangeScale);
                    const effectiveRange = Math.round(tower.range / state.rangeScale);
                    rngEl.innerHTML = formatStatWithBonus(baseRange, effectiveRange);
                }
                if (satLvlEl) satLvlEl.innerText = level;
                if (satDotsEl) satDotsEl.innerHTML = createLvlDotsHTML(level);

                const orbitTowers = state.game.towers.filter(t => t.orbitIndex === tower.orbitIndex);
                const btnPrev = document.getElementById('btn-prev-sat');
                const btnNext = document.getElementById('btn-next-sat');
                if (btnPrev && btnNext) {
                    const canCycle = orbitTowers.length > 1;
                    btnPrev.disabled = !canCycle;
                    btnNext.disabled = !canCycle;
                    btnPrev.classList.toggle('opacity-30', !canCycle);
                    btnPrev.classList.toggle('cursor-not-allowed', !canCycle);
                    btnNext.classList.toggle('opacity-30', !canCycle);
                    btnNext.classList.toggle('cursor-not-allowed', !canCycle);
                }
                if (upgradeBtn && upgradeCostEl) {
                    if (level >= 10) {
                        upgradeBtn.disabled = true;
                        upgradeBtn.className = "w-full mt-2 bg-slate-800 text-slate-500 cursor-not-allowed font-black py-2 rounded text-[10px] flex items-center justify-center gap-2 select-none";
                        upgradeCostEl.innerHTML = "MAXED";
                    } else {
                        const cost = getSatelliteUpgradeCost(tower);
                        const baseUpgradeCost = Math.floor(SATELLITE_CONFIGS[tower.type].cost * 0.75 * level);
                        const upgradeDiff = cost - baseUpgradeCost;
                        let upgradeText = `<i class="fa-solid fa-coins"></i> ${baseUpgradeCost}`;
                        if (upgradeDiff !== 0) {
                            const sign = upgradeDiff > 0 ? '+' : '';
                            const canAfford = state.game.gold >= cost && !(state.waveActive || state.game.mode === 'boss');
                            const colorClass = upgradeDiff > 0 ? (canAfford ? 'text-red-900' : 'text-red-400') : (canAfford ? 'text-emerald-900' : 'text-emerald-400');
                            upgradeText += ` <span class="text-[8px] ${colorClass} ml-0.5">(${sign}${upgradeDiff})</span>`;
                        }
                        if (state.waveActive || state.game.mode === 'boss') {
                            upgradeBtn.disabled = false;
                            upgradeBtn.className = "w-full mt-2 bg-slate-800 text-slate-500 cursor-not-allowed font-black py-2 rounded text-[10px] flex items-center justify-center gap-2 select-none";
                        } else {
                            upgradeBtn.disabled = state.game.gold < cost;
                            upgradeBtn.className = state.game.gold >= cost ?
                                "w-full mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded text-[10px] flex items-center justify-center gap-2 select-none" :
                                "w-full mt-2 bg-slate-800 text-slate-500 cursor-not-allowed font-black py-2 rounded text-[10px] flex items-center justify-center gap-2 select-none";
                        }
                        upgradeCostEl.innerHTML = upgradeText;
                    }
                }

                const destroyBtn = document.getElementById('btn-destroy-sat');
                if (destroyBtn) {
                    if (state.waveActive || state.game.mode === 'boss') {
                        destroyBtn.className = "w-full bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40 font-bold py-2.5 rounded text-[10px] md:text-[11px] flex justify-center items-center gap-2 transition-all min-h-[38px] select-none";
                    } else {
                        destroyBtn.className = "w-full bg-amber-950/85 hover:bg-amber-900 border border-amber-500/40 text-amber-200 font-bold py-2.5 rounded text-[10px] md:text-[11px] flex justify-center items-center gap-2 transition-all min-h-[38px] select-none";
                    }
                }
                renderSatelliteBonusList(tower);

                const p = document.getElementById('inspector-panel');
                if (p) { p.classList.remove('hidden'); p.offsetHeight; p.style.transform = 'translate(0px, 0px)'; }
            } else {
                closeInspector();
            }
        }

        function setMasterAccordion(openPanel) {
            const panels = {
                orbits: {
                    content: document.getElementById('accordion-orbits-content'),
                    icon: document.getElementById('accordion-orbits-icon')
                },
                directives: {
                    content: document.getElementById('accordion-directives-content'),
                    icon: document.getElementById('accordion-directives-icon')
                },
                tactical: {
                    content: document.getElementById('accordion-tactical-content'),
                    icon: document.getElementById('accordion-tactical-icon')
                }
            };

            const target = panels[openPanel];
            const shouldCloseTarget = target && target.content && !target.content.classList.contains('hidden');
            if (shouldCloseTarget) {
                if (target.content) target.content.classList.add('hidden');
                if (target.icon) {
                    target.icon.classList.remove('fa-chevron-up');
                    target.icon.classList.add('fa-chevron-down');
                }
                return;
            }

            Object.entries(panels).forEach(([key, panel]) => {
                const isOpen = key === openPanel;
                if (panel.content) panel.content.classList.toggle('hidden', !isOpen);
                if (panel.icon) {
                    panel.icon.classList.toggle('fa-chevron-up', isOpen);
                    panel.icon.classList.toggle('fa-chevron-down', !isOpen);
                }
            });
        }

        function updateFastForwardUI() {
            ['fast-forward-btn', 'mobile-fast-forward-btn'].forEach(id => {
                const btn = document.getElementById(id);
                if (!btn) return;
                btn.classList.toggle('text-emerald-400', state.game.fastForward);
                btn.classList.toggle('text-slate-400', !state.game.fastForward);
                btn.classList.toggle('border-emerald-400', state.game.fastForward);
                btn.classList.toggle('border-slate-700/60', !state.game.fastForward);
                btn.classList.toggle('bg-emerald-500/20', state.game.fastForward);
                btn.classList.toggle('bg-slate-900', !state.game.fastForward);
                btn.classList.toggle('shadow-[0_0_15px_rgba(16,185,129,0.3)]', state.game.fastForward);

                const icon = btn.querySelector('i');
                if (icon) icon.classList.toggle('animate-pulse', state.game.fastForward);
            });
        }

        function updateOrbitInspectorUI() {
            updateBossCardList();
            const shieldCapLvlElement = document.getElementById('shield-cap-lvl');
            if (!shieldCapLvlElement) return;

            shieldCapLvlElement.innerText = state.shieldUpgradeLevel;
            const shieldCapDots = document.getElementById('shield-cap-dots');
            if (shieldCapDots) {
                let html = "";
                for (let d = 1; d <= 6; d++) {
                    const filledClass = d <= state.shieldUpgradeLevel ? "bg-cyan-400 glow-blue shadow-[0_0_5px_#22d3ee]" : "bg-slate-800 border border-slate-700/60";
                    html += `<div class="h-2 flex-1 rounded-sm ${filledClass}"></div>`;
                }
                shieldCapDots.innerHTML = html;
            }

            const lblShieldCapacity = document.getElementById('lbl-shield-capacity');
            const cmdUpgradeShield = document.getElementById('cmd-upgrade-shield');
            const costUpgradeShield = document.getElementById('cost-upgrade-shield');

            if (lblShieldCapacity && cmdUpgradeShield && costUpgradeShield) {
                lblShieldCapacity.innerHTML = `Cap +25 (Level <span id="shield-cap-lvl">${state.shieldUpgradeLevel}</span>/6)`;
                if (state.shieldUpgradeLevel >= 6) {
                    cmdUpgradeShield.disabled = true; cmdUpgradeShield.className = "bg-slate-800 text-slate-500 cursor-not-allowed rounded-lg p-2 flex flex-col items-center justify-center transition-all select-none";
                    costUpgradeShield.innerText = "MAX LEVEL";
                } else if (state.waveActive || state.game.mode === 'boss') {
                    const cost = 200 + state.shieldUpgradeLevel * 150;
                    cmdUpgradeShield.disabled = false; cmdUpgradeShield.className = "bg-slate-800 text-slate-500 cursor-not-allowed rounded-lg p-2 flex flex-col items-center justify-center transition-all select-none";
                    costUpgradeShield.innerHTML = `<i class="fa-solid fa-coins text-[8px] font-bold"></i> ${cost}G`;
                } else {
                    const cost = 200 + state.shieldUpgradeLevel * 150;
                    cmdUpgradeShield.disabled = false; cmdUpgradeShield.className = "bg-slate-900 hover:bg-slate-800 border border-cyan-500/20 rounded-lg p-2 flex flex-col items-center justify-center transition-all select-none";
                    costUpgradeShield.innerHTML = `<i class="fa-solid fa-coins text-[8px]"></i> ${cost}G`;
                }
            }

            for (let i = 0; i < 3; i++) {
                const card = document.getElementById(`orbit-card-${i}`);
                const slotLbl = document.getElementById(`orbit-slots-${i}`);
                const btn = document.getElementById(`orbit-btn-${i}`);
                const dots = document.getElementById(`orbit-dots-${i}`);

                if (!card || !btn || !slotLbl || !dots) continue;
                const isLocked = state.orbitLockStates[i];
                let dotsHtml = ""; const level = state.orbitUpgradesCount[i];
                for (let d = 1; d <= 6; d++) {
                    const filledClass = d <= level ? "bg-sky-400 glow-blue shadow-[0_0_5px_#38bdf8]" : "bg-slate-800 border border-slate-700/60";
                    dotsHtml += `<div class="h-2 flex-1 rounded-sm ${filledClass}"></div>`;
                }
                dots.innerHTML = dotsHtml;

                if (isLocked) {
                    slotLbl.innerText = "LOCKED"; const unlockCost = ORBIT_UNLOCK_COSTS[i];
                    if (state.waveActive || state.game.mode === 'boss') {
                        btn.innerHTML = `DISABLED WHILE UNDER ATTACK`;
                        btn.disabled = false; btn.className = "w-full bg-slate-800 text-slate-500 cursor-not-allowed py-1.5 rounded text-[10px] uppercase transition-all select-none";
                    } else {
                        btn.innerHTML = `Unlock Orbit Array — <i class="fa-solid fa-coins text-[8px]"></i> ${unlockCost}G`;
                        if (state.game && state.game.gold >= unlockCost) {
                            btn.disabled = false; btn.className = "w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-1.5 rounded text-[10px] uppercase transition-all select-none";
                        } else {
                            btn.disabled = true; btn.className = "w-full bg-slate-800 text-slate-500 cursor-not-allowed py-1.5 rounded text-[10px] uppercase transition-all select-none";
                        }
                    }
                } else {
                    slotLbl.innerText = state.orbitSlotCapacities[i];
                    if (level >= 6) {
                        btn.disabled = true; btn.className = "w-full bg-slate-800 text-slate-500 cursor-not-allowed py-1.5 rounded text-[10px] uppercase transition-all select-none";
                        btn.innerText = "MAX SLOTS EXPANDED";
                    } else {
                        const upgradeCost = 500 + level * 100;
                        if (state.waveActive || state.game.mode === 'boss') {
                            btn.innerHTML = `DISABLED WHILE UNDER ATTACK`;
                            btn.disabled = false; btn.className = "w-full bg-slate-800 text-slate-500 cursor-not-allowed py-1.5 rounded text-[10px] uppercase transition-all select-none";
                        } else {
                            btn.innerHTML = `Expand Orbit (+1 Slot) — <i class="fa-solid fa-coins text-[8px]"></i> ${upgradeCost}G`;
                            if (state.game && state.game.gold >= upgradeCost) {
                                btn.disabled = false; btn.className = "w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-1.5 rounded text-[10px] uppercase transition-all select-none";
                            } else {
                                btn.disabled = true; btn.className = "w-full bg-slate-800 text-slate-500 cursor-not-allowed py-1.5 rounded text-[10px] uppercase transition-all select-none";
                            }
                        }
                    }
                }
            }

            const tacticalItems = [
                { id: 'laser', cost: 300, name: 'Orbital Strike', color: 'red' },
                { id: 'emp', cost: 400, name: 'EMP Pulse', color: 'cyan' },
                { id: 'overcharge', cost: 500, name: 'Shield Surge', color: 'emerald' }
            ];

            tacticalItems.forEach(item => {
                const btn = document.getElementById(`cmd-unlock-tactical-${item.id}`);
                if (!btn) return;

                if (state.game.tactical && state.game.tactical[item.id] && state.game.tactical[item.id].unlocked) {
                    btn.disabled = true;
                    btn.className = `w-full mt-2 bg-slate-900 border border-${item.color}-500/30 text-${item.color}-500 cursor-not-allowed font-black py-2 rounded text-[10px] uppercase transition-all select-none`;
                    btn.innerHTML = `<i class="fa-solid fa-check mb-1"></i> ${item.name} Online`;
                } else {
                    if (state.waveActive || state.game.mode === 'boss') {
                        btn.disabled = true;
                        btn.className = "w-full mt-2 bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40 font-black py-2 rounded text-[10px] uppercase transition-all select-none";
                        btn.innerText = "DISABLED WHILE UNDER ATTACK";
                    } else if (state.game.gold >= item.cost) {
                        btn.disabled = false;
                        btn.className = `w-full mt-2 bg-${item.color}-500 hover:bg-${item.color}-400 text-slate-950 font-black py-2 rounded text-[10px] uppercase transition-all select-none`;
                        btn.innerHTML = `Unlock ${item.name} — <i class="fa-solid fa-coins text-[8px]"></i> ${item.cost}G`;
                    } else {
                        btn.disabled = true;
                        btn.className = "w-full mt-2 bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40 font-black py-2 rounded text-[10px] uppercase transition-all select-none";
                        btn.innerHTML = `Unlock ${item.name} — <i class="fa-solid fa-coins text-[8px]"></i> ${item.cost}G`;
                    }
                }
            });
        }

        function handleOrbitButtonPress(index) {
            if (state.waveActive || state.game.mode === 'boss') {
                showGameNotice('<i class="fa-solid fa-triangle-exclamation mr-1"></i> Orbit expansion is disabled while under attack.', 3000);
                return;
            }
            const isLocked = state.orbitLockStates[index];
            if (isLocked) {
                const cost = ORBIT_UNLOCK_COSTS[index];
                if (state.game.gold >= cost) {
                    spendGold(cost); state.orbitLockStates[index] = false; playSynthSound('upgrade'); createExplosion(canvas.width / 2, canvas.height / 2, '#fbbf24', 20);
                    const hint = document.getElementById('action-hint');
                    if (hint) hint.innerHTML = `<span class="text-emerald-400 font-bold">Orbit Array #${index + 1} unlocked!</span>`;
                    updateOrbitInspectorUI();
                    updateBlueprintOverlay();
                } else {
                    const hint = document.getElementById('action-hint');
                    if (hint) hint.innerHTML = `<span class="text-red-400 font-bold">Need ${cost} Gold to unlock!</span>`;
                }
            } else {
                const upgrades = state.orbitUpgradesCount[index];
                if (upgrades >= 6) return;
                const cost = 500 + upgrades * 100;
                if (state.game.gold >= cost) {
                    spendGold(cost); state.orbitUpgradesCount[index]++; state.orbitSlotCapacities[index]++;
                    for (let tower of state.game.towers) { if (tower.orbitIndex === index) tower.updateCoordinates(); }
                    playSynthSound('upgrade'); createExplosion(canvas.width / 2, canvas.height / 2, '#38bdf8', 20);
                    const hint = document.getElementById('action-hint');
                    if (hint) hint.innerHTML = `<span class="text-emerald-400 font-bold">Orbit Array #${index + 1} expanded to ${state.orbitSlotCapacities[index]} slots!</span>`;
                    updateOrbitInspectorUI();
                    updateBlueprintOverlay();
                } else {
                    const hint = document.getElementById('action-hint');
                    if (hint) hint.innerHTML = `<span class="text-red-400 font-bold">Need ${cost} Gold to expand!</span>`;
                }
            }
        }

        function updateGoldUI() {
            const mobileGold = document.getElementById('mobile-gold');
            const bottomGold = document.getElementById('bottom-gold');
            if (mobileGold) mobileGold.innerText = state.game.gold;
            if (bottomGold) bottomGold.innerText = state.game.gold;
            updateShopAvailability(); updateOrbitInspectorUI();
        }

        function addGold(amount) { state.game.gold += amount; updateGoldUI(); }
        function setGold(amount) { state.game.gold = amount; updateGoldUI(); }
        function spendGold(amount) { state.game.gold -= amount; updateGoldUI(); }

        function getSatelliteBuildCost(type) {
            let discount = getDirectiveEffectValue('buildDiscount', 0);
            const debt = getDirectiveEffectValue('debtFinancing');
            if (debt) discount += debt.discount;
            return Math.max(1, Math.floor(SATELLITE_CONFIGS[type].cost * Math.max(0.15, 1 - discount)));
        }

        function updateShopAvailability() {
            const items = [
                { id: 'shop-laser', type: 'laser', cost: 100, activeColor: 'border-cyan-400' },
                { id: 'shop-plasma', type: 'plasma', cost: 180, activeColor: 'border-emerald-400' },
                { id: 'shop-missile', type: 'missile', cost: 350, activeColor: 'border-red-500' },
                { id: 'shop-railgun', type: 'railgun', cost: 500, activeColor: 'border-purple-500' },
                { id: 'shop-lasersentry', type: 'lasersentry', cost: 260, activeColor: 'border-cyan-300' },
                { id: 'shop-lightningsentry', type: 'lightningsentry', cost: 380, activeColor: 'border-amber-400' },
                { id: 'shop-magnetsentry', type: 'magnetsentry', cost: 280, activeColor: 'border-blue-400' }
            ];
            items.forEach(item => {
                const el = document.getElementById(item.id);
                if (!el) return;
                const canAfford = state.game.gold >= getSatelliteBuildCost(item.type);
                const isSelected = state.game.selectedShopType === item.type;
                el.classList.remove('opacity-40', 'border-cyan-500/40', 'border-emerald-500/40', 'border-red-500/40', 'border-purple-500/40', 'border-cyan-400/40', 'border-amber-400/40', 'border-blue-400/40', 'border-emerald-400', 'border-2', 'border-red-500', 'border-purple-500', 'border-cyan-400', 'border-cyan-300', 'border-amber-400', 'border-blue-400', 'border-slate-800');
                el.style.boxShadow = '';
                if (!canAfford) { el.classList.add('opacity-40', 'border-slate-800'); } else {
                    if (isSelected) {
                        el.classList.add('border-2', item.activeColor);
                        if (item.type === 'laser' || item.type === 'lasersentry') el.style.boxShadow = '0 0 15px rgba(56,189,248,0.5)';
                        if (item.type === 'plasma') el.style.boxShadow = '0 0 15px rgba(16,185,129,0.5)';
                        if (item.type === 'missile') el.style.boxShadow = '0 0 15px rgba(239,68,68,0.5)';
                        if (item.type === 'railgun') el.style.boxShadow = '0 0 15px rgba(168,85,247,0.5)';
                        if (item.type === 'lightningsentry') el.style.boxShadow = '0 0 15px rgba(245,158,11,0.5)';
                        if (item.type === 'magnetsentry') el.style.boxShadow = '0 0 15px rgba(59,130,246,0.5)';
                    } else {
                        if (item.type === 'laser') el.classList.add('border-cyan-500/40');
                        if (item.type === 'plasma') el.classList.add('border-emerald-500/40');
                        if (item.type === 'missile') el.classList.add('border-red-500/40');
                        if (item.type === 'railgun') el.classList.add('border-purple-500/40');
                        if (item.type === 'lasersentry') el.classList.add('border-cyan-400/40');
                        if (item.type === 'lightningsentry') el.classList.add('border-amber-400/40');
                        if (item.type === 'magnetsentry') el.classList.add('border-blue-400/40');
                    }
                }
            });
        }

        function getSatelliteUpgradeCost(tower) {
            if (!tower || (tower.level || 1) >= 10) return 0;
            let multiplier = 1;
            if (tower.orbitIndex === 1) multiplier += 0.25;
            if (tower.orbitIndex === 2) multiplier += 0.50;
            const railTradeoff = getDirectiveEffectValue('railgunUpgradeTradeoff');
            if (tower.type === 'railgun' && railTradeoff) multiplier += railTradeoff.cost;
            return Math.floor(SATELLITE_CONFIGS[tower.type].cost * 0.75 * (tower.level || 1) * multiplier);
        }

        export function getSatelliteMaxHp(type) {
            const baseHp = 85 + SATELLITE_CONFIGS[type].cost * 0.28;
            let multiplier = 1 + getDirectiveEffectValue('satelliteHp', 0);
            const glass = getDirectiveEffectValue('glassCannon');
            if (glass) multiplier -= glass.hp;
            return Math.max(20, Math.floor(baseHp * multiplier));
        }
        function getSatelliteRepairCost(tower) {
            if (!tower) return 0;
            const missingHp = Math.max(0, tower.maxHp - tower.hp);
            let multiplier = 1;
            if (tower.orbitIndex === 1) multiplier += 0.25;
            if (tower.orbitIndex === 2) multiplier += 0.50;
            const overdrive = getDirectiveEffectValue('overdriveRepair');
            if (overdrive) multiplier += overdrive.repair;
            return Math.ceil(missingHp * 1.5 * multiplier);
        }
        function getSatelliteSalvageValue(tower) {
            if (!tower) return 0;
            let multiplier = 1;
            if (tower.orbitIndex === 1) multiplier -= 0.15;
            if (tower.orbitIndex === 2) multiplier -= 0.30;
            return Math.floor((tower.investedGold || SATELLITE_CONFIGS[tower.type].cost) * 0.25 * (1 + getDirectiveEffectValue('salvage', 0)) * multiplier);
        }

        function getDirectiveDefinition(id) {
            return COMMAND_DIRECTIVES.find(directive => directive.id === id);
        }

        function getDirectiveLevel(id) {
            return state.game.commandDirectives[id] || 0;
        }

        function getDirectiveEffectValue(effect, fallback = null) {
            const directive = COMMAND_DIRECTIVES.find(item => item.effect === effect);
            if (!directive) return fallback;
            const level = getDirectiveLevel(directive.id);
            return level > 0 ? directive.values[level - 1] : fallback;
        }

        function getDirectiveEffectValueById(id, fallback = null) {
            const directive = getDirectiveDefinition(id);
            const level = getDirectiveLevel(id);
            return directive && level > 0 ? directive.values[level - 1] : fallback;
        }

        function getDirectiveContext(directive) {
            return DIRECTIVE_EFFECT_CONTEXT[directive.effect] || 'Command directive. It changes the tactical rules for future defense waves and does not affect boss intercept missions.';
        }

        function getDirectiveDescription(directive, nextLevel = null) {
            const level = nextLevel || getDirectiveLevel(directive.id) || 1;
            const levelText = directive.levels[Math.max(0, Math.min(4, level - 1))];
            return `${levelText}. ${getDirectiveContext(directive)}`;
        }

        function syncPlanetBars() {
            state.game.earthHealth = Math.min(state.game.earthHealth, state.game.earthMaxHealth);
            state.game.earthShield = Math.min(state.game.earthShield, state.game.earthMaxShield);
            const healthWPercent = `${(state.game.earthHealth / state.game.earthMaxHealth) * 100}%`;
            const shieldWPercent = `${(state.game.earthShield / state.game.earthMaxShield) * 100}%`;
            const healthText = document.getElementById('health-text');
            const mobileHealthText = document.getElementById('mobile-health-text');
            const healthBar = document.getElementById('health-bar');
            const mobileHealthBar = document.getElementById('mobile-health-bar');
            const shieldText = document.getElementById('shield-text');
            const mobileShieldText = document.getElementById('mobile-shield-text');
            const shieldBar = document.getElementById('shield-bar');
            const mobileShieldBar = document.getElementById('mobile-shield-bar');
            if (healthText) healthText.innerText = `${state.game.earthHealth} / ${state.game.earthMaxHealth}`;
            if (mobileHealthText) mobileHealthText.innerText = `${state.game.earthHealth}/${state.game.earthMaxHealth}`;
            if (healthBar) healthBar.style.width = healthWPercent;
            if (mobileHealthBar) mobileHealthBar.style.width = healthWPercent;
            if (shieldText) shieldText.innerText = `${state.game.earthShield} / ${state.game.earthMaxShield}`;
            if (mobileShieldText) mobileShieldText.innerText = `${state.game.earthShield}/${state.game.earthMaxShield}`;
            if (shieldBar) shieldBar.style.width = shieldWPercent;
            if (mobileShieldBar) mobileShieldBar.style.width = shieldWPercent;
        }

        function addRandomOrbitSlots(count) {
            for (let n = 0; n < count; n++) {
                const candidates = [0, 1, 2].filter(index => state.orbitSlotCapacities[index] < 10);
                if (!candidates.length) return;
                const orbitIndex = candidates[Math.floor(Math.random() * candidates.length)];
                state.orbitLockStates[orbitIndex] = false;
                state.orbitSlotCapacities[orbitIndex]++;
                state.orbitUpgradesCount[orbitIndex] = Math.min(6, state.orbitUpgradesCount[orbitIndex] + 1);
            }
            for (let tower of state.game.towers) tower.updateCoordinates();
            updateOrbitInspectorUI();
            updateBlueprintOverlay();
        }

        function applyDirectiveLevelUp(directive, previousLevel, newLevel) {
            const previousValue = previousLevel > 0 ? directive.values[previousLevel - 1] : null;
            const newValue = directive.values[newLevel - 1];
            if (directive.effect === 'grantGold') {
                addGold(newValue);
            } else if (directive.effect === 'shieldForGold') {
                state.game.earthShield = Math.max(0, state.game.earthShield - newValue.shield);
                addGold(newValue.gold);
                syncPlanetBars();
            } else if (directive.effect === 'coreMaxHp') {
                const delta = newValue - (previousValue || 0);
                state.game.earthMaxHealth += delta;
                state.game.earthHealth += Math.max(0, delta);
                syncPlanetBars();
            } else if (directive.effect === 'maxShield') {
                const delta = newValue - (previousValue || 0);
                state.game.earthMaxShield += delta;
                state.game.earthShield += Math.max(0, delta);
                syncPlanetBars();
            } else if (directive.effect === 'shieldWeapon') {
                const delta = newValue.shield - (previousValue ? previousValue.shield : 0);
                state.game.earthMaxShield = Math.max(25, state.game.earthMaxShield - delta);
                syncPlanetBars();
            } else if (directive.effect === 'fragileShield') {
                state.game.earthMaxShield = Math.max(25, Math.floor(100 * (1 - newValue.maxLoss)) + state.shieldUpgradeLevel * 25 + (getDirectiveEffectValue('maxShield', 0) || 0));
                syncPlanetBars();
            } else if (directive.effect === 'repairAll') {
                for (const tower of state.game.towers) tower.hp = Math.min(tower.maxHp, tower.hp + tower.maxHp * newValue);
            } else if (directive.effect === 'satelliteHp' || directive.effect === 'glassCannon') {
                for (const tower of state.game.towers) {
                    const hpPercent = tower.maxHp > 0 ? tower.hp / tower.maxHp : 1;
                    tower.maxHp = getSatelliteMaxHp(tower.type);
                    tower.hp = Math.max(1, Math.min(tower.maxHp, tower.maxHp * hpPercent));
                }
            } else if (directive.effect === 'grantSlots') {
                addRandomOrbitSlots(newValue.slots);
                if (newValue.gold) addGold(newValue.gold);
            } else if (directive.effect === 'warBudget') {
                addGold(newValue.gold);
            } else if (directive.effect === 'recklessExpansion') {
                addRandomOrbitSlots(newValue.slots);
                state.game.earthMaxHealth = Math.max(50, state.game.earthMaxHealth - newValue.hp);
                syncPlanetBars();
            }
            updateBossCardList();
        }

        function updateBossCardList() {
            const cardList = document.getElementById('boss-card-list');
            const cardCount = document.getElementById('boss-card-count');
            if (!cardList || !cardCount) return;
            const directives = Object.entries(state.game.commandDirectives)
                .map(([id, level]) => ({ ...getDirectiveDefinition(id), level }))
                .filter(Boolean)
                .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
            cardCount.innerText = `${directives.length} Active`;
            cardList.innerHTML = directives.length
                ? directives.map(directive => `<div class="bg-slate-900 border border-amber-500/20 rounded px-2 py-1">
                    <div class="flex justify-between gap-2"><span style="color:${directive.color}" class="font-black uppercase">${directive.name}</span><span class="text-amber-300">LVL ${directive.level}</span></div>
                    <div>${getDirectiveDescription(directive)}</div>
                    <div class="text-slate-500 uppercase">${directive.rarity}</div>
                </div>`).join('')
                : 'No command directives acquired.';
        }

        export function getTargetedDamageMultiplier(enemy, weaponType = '') {
            let multiplier = 1;
            if (enemy.category === 'ship' || enemy.category === 'miniboss') multiplier += getDirectiveEffectValue('shipDamage', 0);
            if (enemy.category === 'normal') multiplier += getDirectiveEffectValue('rockDamage', 0);
            if (enemy.slowMultiplier < 1) multiplier += getDirectiveEffectValue('slowedDamage', 0);
            if (getDirectiveEffectValue('strongestDamage') && state.game.wave % 5 === 0) {
                const strongest = state.game.enemies.reduce((best, item) => item.hp > (best ? best.hp : -1) ? item : best, null);
                if (strongest && strongest.id === enemy.id) multiplier += getDirectiveEffectValue('strongestDamage', 0);
            }
            if (weaponType === 'plasma') multiplier += getDirectiveEffectValue('plasmaDamage', 0);

            // Inherent Satellite Specialties & Weaknesses
            if (weaponType === 'laser') {
                if (enemy.category === 'ship' || enemy.category === 'miniboss') multiplier += 0.50;
                if (enemy.category === 'normal') multiplier -= 0.25;
            } else if (weaponType === 'plasma') {
                if (enemy.category === 'normal') multiplier += 0.50;
                if (enemy.category === 'ship' || enemy.category === 'miniboss') multiplier -= 0.25;
            } else if (weaponType === 'missile') {
                if (enemy.category === 'ship' || enemy.category === 'miniboss') multiplier += 0.25;
            } else if (weaponType === 'railgun') {
                if (enemy.category === 'normal') multiplier += 0.50;
                if (enemy.category === 'ship' || enemy.category === 'miniboss') multiplier -= 0.25;
            }

            return Math.max(0.1, multiplier); // Prevent healing enemies
        }

        function createLvlDotsHTML(lvl) {
            let html = "";
            for (let i = 1; i <= 10; i++) {
                const filledClass = i <= lvl ? "bg-amber-400 animate-pulse" : "bg-slate-800 border border-slate-700/60";
                html += `<div class="h-2 flex-1 rounded-sm ${filledClass}"></div>`;
            }
            return html;
        }

        function triggerPauseToggle() {
            if (state.game && state.game.running) {
                state.game.paused = true;
                pauseBgm();
                const p = document.getElementById('pause-modal');
                if (p) p.classList.remove('hidden');
                playSynthSound('upgrade');
            }
        }

        function setWaveLaunchReady(isReady) {
            ['mobile-launch-btn'].forEach(id => {
                const btn = document.getElementById(id);
                if (!btn) return;
                const bossReady = isReady && isBossWave(state.game.wave);
                btn.disabled = !isReady;
                btn.classList.toggle('wave-ready', isReady);
                btn.classList.toggle('boss-wave-ready', bossReady);
                btn.classList.toggle('opacity-45', !isReady);
                btn.classList.toggle('cursor-not-allowed', !isReady);
                btn.innerHTML = bossReady
                    ? `<i class="fa-solid fa-skull"></i> <span>ENTER BOSS ROUND</span>`
                    : `<i class="fa-solid fa-play"></i> <span>START NEXT WAVE</span>`;
            });
        }

        function showWaveEvent(title, subtitle, color = 'amber', duration = 2700) {
            const banner = document.getElementById('wave-event-banner');
            const titleEl = document.getElementById('wave-event-title');
            const subtitleEl = document.getElementById('wave-event-subtitle');
            if (!banner || !titleEl || !subtitleEl) return;
            titleEl.innerText = title;
            subtitleEl.innerText = subtitle;
            titleEl.className = color === 'emerald'
                ? 'wave-event-title text-emerald-300'
                : color === 'red' ? 'wave-event-title text-red-400'
                    : color === 'fuchsia' ? 'wave-event-title text-fuchsia-400'
                        : 'wave-event-title text-amber-300';
            banner.classList.remove('hidden', 'wave-event-pop');
            banner.offsetHeight;
            banner.classList.add('wave-event-pop');
            if (banner.hideTimeout) clearTimeout(banner.hideTimeout);
            banner.hideTimeout = setTimeout(() => banner.classList.add('hidden'), duration);
        }

        function setBuildControlEnabled(isEnabled) {
            const buildBtn = document.getElementById('open-build-drawer-btn');
            if (!buildBtn) return;
            buildBtn.classList.toggle('opacity-45', !isEnabled);
            buildBtn.classList.toggle('cursor-not-allowed', !isEnabled);
            updateBuildButtonState();
        }

        function cancelBuildMode(options = {}) {
            state.game.selectedShopType = null;
            state.game.orbitGridHighlights = false;
            suppressStarterTooltips(false);
            if (!options.keepHint) {
                const hint = document.getElementById('action-hint');
                if (hint) hint.innerText = "Tap the planet core to open Master Command, or tap BUILD to deploy satellites!";
            }
            updateShopAvailability();
            updateBuildButtonState();
        }

        function hasEmptyDeployableOrbitSlot() {
            for (let orbitIndex = 0; orbitIndex < state.orbitSlotCapacities.length; orbitIndex++) {
                if (state.orbitLockStates[orbitIndex]) continue;
                for (let slotIndex = 0; slotIndex < state.orbitSlotCapacities[orbitIndex]; slotIndex++) {
                    if (!state.game.towers.some(tower => tower.orbitIndex === orbitIndex && tower.slotIndex === slotIndex)) {
                        return true;
                    }
                }
            }
            return false;
        }

        function notifyNoEmptyOrbitSlots() {
            showOrbitExpansionPrompt();
            const hint = document.getElementById('action-hint');
            if (hint) hint.innerHTML = `<span class="text-red-300 font-bold">No empty orbit slots. Tap the planet to add slots in Master Command.</span>`;
            updateBlueprintOverlay();
        }

        function updateBuildButtonState() {
            const buildBtn = document.getElementById('open-build-drawer-btn');
            if (!buildBtn) return;
            if (state.game && state.game.selectedShopType) {
                buildBtn.classList.remove('bg-emerald-500', 'hover:bg-emerald-400', 'glow-green');
                buildBtn.classList.add('bg-red-500', 'hover:bg-red-400', 'glow-red');
                buildBtn.innerHTML = `<i class="fa-solid fa-ban font-bold"></i><span class="md:hidden">CANCEL</span><span class="hidden md:inline">CANCEL BUILD</span>`;
            } else {
                buildBtn.classList.remove('bg-red-500', 'hover:bg-red-400', 'glow-red');
                buildBtn.classList.add('bg-emerald-500', 'hover:bg-emerald-400', 'glow-green');
                buildBtn.innerHTML = `<i class="fa-solid fa-hammer font-bold"></i><span class="md:hidden">BUILD</span><span class="hidden md:inline">BUILD SATELLITE</span>`;
            }
        }

        export function showGameNotice(message, duration = 2400) {
            const notice = document.getElementById('game-notice');
            if (!notice) return;
            notice.innerHTML = message;
            notice.classList.remove('hidden', 'notice-pop');
            notice.offsetHeight;
            notice.classList.add('notice-pop');
            if (state.gameNoticeTimer) clearTimeout(state.gameNoticeTimer);
            state.gameNoticeTimer = setTimeout(() => notice.classList.add('hidden'), duration);
        }

        function showModeTransition(title, subtitle = 'Reconfiguring command systems', icon = 'fa-circle-nodes', duration = 1450, onCovered = null) {
            const overlay = document.getElementById('mode-transition-overlay');
            const titleEl = document.getElementById('mode-transition-title');
            const subtitleEl = document.getElementById('mode-transition-subtitle');
            const iconEl = document.getElementById('mode-transition-icon');
            state.modeTransitionActive = true;
            if (!overlay) {
                if (typeof onCovered === 'function') onCovered();
                state.modeTransitionActive = false;
                return;
            }
            if (titleEl) titleEl.innerText = title;
            if (subtitleEl) subtitleEl.innerText = subtitle;
            if (iconEl) iconEl.className = `fa-solid ${icon} text-cyan-300 text-2xl animate-spin-slow`;
            overlay.classList.remove('hidden', 'mode-transition-pop');
            overlay.classList.add('flex');
            overlay.offsetHeight;
            overlay.classList.add('mode-transition-pop');
            setTimeout(() => {
                if (typeof onCovered === 'function') onCovered();
            }, Math.floor(duration * 0.34));
            setTimeout(() => {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex', 'mode-transition-pop');
                state.modeTransitionActive = false;
            }, duration);
        }

        function setStarterTooltipsVisible(isVisible) {
            state.starterTooltipsSuppressed = false;
            state.tutorialHints.planet = isVisible && !state.planetTutorialTooltipShown;
            state.tutorialHints.build = isVisible;
            updateTutorialTooltips();
        }

        function suppressStarterTooltips(isSuppressed) {
            state.starterTooltipsSuppressed = isSuppressed;
            updateTutorialTooltips();
        }

        function updateTutorialTooltips() {
            const planetTip = document.getElementById('planet-tutorial-tooltip');
            const buildTip = document.getElementById('build-tutorial-tooltip');
            const introModal = document.getElementById('intro-modal');
            const hasIntroOpen = introModal && !introModal.classList.contains('hidden');
            const inputWord = isCoarsePointerInput() ? 'Tap' : 'Click';

            if (planetTip) {
                if (state.game.running && !hasIntroOpen && !state.starterTooltipsSuppressed && state.tutorialHints.planet && !state.planetTutorialTooltipShown) {
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const safeTopOffset = window.visualViewport ? window.visualViewport.offsetTop : 0;
                    const tipTop = Math.max(safeTopOffset + 92, centerY - state.EARTH_RADIUS - 52);
                    planetTip.innerText = `${inputWord} the Planet to access Master Command Center`;
                    planetTip.style.left = `${centerX}px`;
                    planetTip.style.top = `${tipTop}px`;
                    planetTip.style.transform = 'translateX(-50%)';
                    planetTip.classList.remove('hidden');
                    state.planetTutorialTooltipShown = true;
                } else {
                    planetTip.classList.add('hidden');
                }
            }

            if (buildTip) {
                const buildText = document.getElementById('build-tutorial-text');
                if (buildText) buildText.innerText = `${inputWord} here to deploy satellites`;
                buildTip.classList.toggle('hidden', !(state.game.running && !hasIntroOpen && !state.starterTooltipsSuppressed && state.tutorialHints.build));
                const buildButton = document.getElementById('open-build-drawer-btn');
                if (buildButton && !buildTip.classList.contains('hidden')) {
                    const tipRect = buildTip.getBoundingClientRect();
                    const buttonRect = buildButton.getBoundingClientRect();
                    const targetX = buttonRect.left + buttonRect.width / 2;
                    const targetY = buttonRect.top + buttonRect.height / 2;
                    const connectorLeft = targetX - tipRect.left;
                    const connectorHeight = Math.max(24, targetY - tipRect.bottom - 5);
                    buildTip.style.setProperty('--connector-left', `${connectorLeft}px`);
                    buildTip.style.setProperty('--connector-height', `${connectorHeight}px`);
                }
            }
        }

        function refreshAtmosphereSelection() {
            document.querySelectorAll('.theme-preset-btn').forEach(btn => {
                const isActive = btn.dataset.theme === state.activeThemeKey;
                btn.classList.remove('border-sky-500/80', 'border-emerald-400', 'glow-blue', 'ring-2', 'ring-emerald-400');
                btn.classList.toggle('border-slate-800', !isActive);
                if (isActive) {
                    btn.classList.add('border-emerald-400', 'ring-2', 'ring-emerald-400', 'glow-blue');
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    btn.setAttribute('aria-pressed', 'false');
                }
            });
        }

        // ----------------------------------------------------------------------
        // 6. CLASSES
        // ----------------------------------------------------------------------
        

        

        

        

        // ----------------------------------------------------------------------
        // 7. GRAPHICS/MATH HELPERS
        // ----------------------------------------------------------------------
        function createExplosion(x, y, color, count) {
            for (let i = 0; i < count; i++) state.game.particles.push(new Particle(x, y, color));
        }

        export function damageSatellite(tower, amount, enemyCategory = null) {
            if (!tower || !state.game.towers.includes(tower)) return;

            let multiplier = 1;
            if (enemyCategory) {
                if (tower.type === 'laser' && enemyCategory === 'normal') multiplier = 1.5;
                else if (tower.type === 'plasma' && (enemyCategory === 'ship' || enemyCategory === 'miniboss')) multiplier = 1.5;
                else if (tower.type === 'missile' && enemyCategory === 'normal') multiplier = 1.25;
                else if (tower.type === 'railgun' && (enemyCategory === 'ship' || enemyCategory === 'miniboss')) multiplier = 1.5;
            }

            const finalDamage = Math.max(1, Math.floor(amount * multiplier));
            tower.hp = Math.max(0, tower.hp - finalDamage);
            if (state.game.selectedTower && state.game.selectedTower.id === tower.id) selectTower(tower);
            if (tower.hp <= 0) {
                createExplosion(tower.x, tower.y, '#ef4444', 18);
                state.game.towers = state.game.towers.filter(item => item.id !== tower.id);
                if (state.game.selectedTower && state.game.selectedTower.id === tower.id) closeInspector();
                updateBlueprintOverlay();
            }
        }

        export function damageEarth(incomingBaseDamage) {
            const damageMultiplier = Math.max(0.15, 1 - getDirectiveEffectValue('coreDamageReduction', 0) + (getDirectiveEffectValue('corePowered') ? getDirectiveEffectValue('corePowered').taken : 0));
            const incomingDamage = Math.max(1, Math.floor(incomingBaseDamage * damageMultiplier));
            const shieldBeforeHit = state.game.earthShield;
            if (state.game.earthShield > 0) {
                const remainingDamage = Math.max(0, incomingDamage - state.game.earthShield);
                state.game.earthShield = Math.max(0, state.game.earthShield - incomingDamage);
                if (remainingDamage > 0) {
                    state.game.earthHealth = Math.max(0, state.game.earthHealth - remainingDamage);
                    state.game.cameraShake = Math.min(25, (state.game.cameraShake || 0) + 12 * state.screenShakeIntensity);
                    state.game.damageOverlayAlpha = 0.8;
                } else {
                    state.game.cameraShake = Math.min(10, (state.game.cameraShake || 0) + 3 * state.screenShakeIntensity);
                    state.game.shieldOverlayAlpha = 0.8;
                }
                playSynthSound(remainingDamage > 0 ? 'earth_hit' : 'shield_deflect');
            } else {
                state.game.earthHealth = Math.max(0, state.game.earthHealth - incomingDamage); state.game.cameraShake = Math.min(25, (state.game.cameraShake || 0) + 12 * state.screenShakeIntensity); state.game.damageOverlayAlpha = 0.8; playSynthSound('earth_hit');
            }
            if (shieldBeforeHit > 0 && state.game.earthShield <= 0) {
                const shockDamage = getDirectiveEffectValue('shieldBreakDamage', 0);
                if (shockDamage) {
                    for (const e of state.game.enemies) {
                        e.hp -= shockDamage;
                        if (shockDamage >= 320) {
                            e.slowMultiplier = Math.min(e.slowMultiplier, shockDamage >= 460 ? 0.35 : 0.55);
                            e.slowTimer = Math.max(e.slowTimer, 180);
                        }
                    }
                    createExplosion(canvas.width / 2, canvas.height / 2, '#67e8f9', 35);
                }
            }

            const shieldWPercent = `${(state.game.earthShield / state.game.earthMaxShield) * 100}%`;
            const shieldText = document.getElementById('shield-text'); const mobileShieldText = document.getElementById('mobile-shield-text');
            const shieldBar = document.getElementById('shield-bar'); const mobileShieldBar = document.getElementById('mobile-shield-bar');
            if (shieldText) shieldText.innerText = `${state.game.earthShield} / ${state.game.earthMaxShield}`;
            if (mobileShieldText) mobileShieldText.innerText = `${state.game.earthShield}/${state.game.earthMaxShield}`;
            if (shieldBar) shieldBar.style.width = shieldWPercent;
            if (mobileShieldBar) mobileShieldBar.style.width = shieldWPercent;

            const healthWPercent = `${(state.game.earthHealth / state.game.earthMaxHealth) * 100}%`;
            const healthText = document.getElementById('health-text'); const mobileHealthText = document.getElementById('mobile-health-text');
            const healthBar = document.getElementById('health-bar'); const mobileHealthBar = document.getElementById('mobile-health-bar');
            if (healthText) healthText.innerText = `${state.game.earthHealth} / ${state.game.earthMaxHealth}`;
            if (mobileHealthText) mobileHealthText.innerText = `${state.game.earthHealth}/${state.game.earthMaxHealth}`;
            if (healthBar) healthBar.style.width = healthWPercent;
            if (mobileHealthBar) mobileHealthBar.style.width = healthWPercent;

            if (state.game.earthHealth <= 0) {
                state.game.running = false;
                const finalWave = document.getElementById('final-wave'); const finalScore = document.getElementById('final-score');
                const finalTowers = document.getElementById('final-towers'); const gameoverModal = document.getElementById('gameover-modal');
                if (finalWave) finalWave.innerText = state.game.wave;
                if (finalScore) finalScore.innerText = state.game.score;
                if (finalTowers) finalTowers.innerText = state.game.towersBuiltCount;
                if (gameoverModal) gameoverModal.classList.remove('hidden');
            }
        }

        function drawProceduralPlanetSurface(activePalette) {
            const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, state.EARTH_RADIUS);
            grad.addColorStop(0, activePalette.coreStart); grad.addColorStop(0.7, activePalette.coreStart); grad.addColorStop(1, activePalette.coreEnd);
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, state.EARTH_RADIUS, 0, Math.PI * 2); ctx.fill();
            ctx.save();
            ctx.rotate(state.earthRotation);
            ctx.fillStyle = activePalette.land; ctx.beginPath();
            ctx.arc(-15 * state.gameScale, -8 * state.gameScale, 12 * state.gameScale, 0, Math.PI * 2); ctx.arc(20 * state.gameScale, 8 * state.gameScale, 14 * state.gameScale, 0, Math.PI * 2);
            ctx.arc(8 * state.gameScale, -20 * state.gameScale, 9 * state.gameScale, 0, Math.PI * 2); ctx.arc(-12 * state.gameScale, 20 * state.gameScale, 8 * state.gameScale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function drawTexturedPlanetSurface(activePalette) {
            const texture = planetTextures[state.activeThemeKey];
            if (!texture || !texture.complete || texture.naturalWidth === 0) {
                drawProceduralPlanetSurface(activePalette);
                return;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, state.EARTH_RADIUS, 0, Math.PI * 2);
            ctx.clip();

            const sourceSize = texture.naturalHeight;
            const maxSourceX = Math.max(0, texture.naturalWidth - sourceSize);
            const panProgress = 0.5 + Math.sin(state.earthRotation * 0.45) * 0.5;
            const sourceX = maxSourceX * panProgress;
            ctx.drawImage(texture, sourceX, 0, sourceSize, sourceSize, -state.EARTH_RADIUS, -state.EARTH_RADIUS, state.EARTH_RADIUS * 2, state.EARTH_RADIUS * 2);

            const limbShade = ctx.createRadialGradient(-state.EARTH_RADIUS * 0.35, -state.EARTH_RADIUS * 0.45, state.EARTH_RADIUS * 0.15, 0, 0, state.EARTH_RADIUS);
            limbShade.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
            limbShade.addColorStop(0.48, 'rgba(255, 255, 255, 0.02)');
            limbShade.addColorStop(0.78, 'rgba(3, 7, 18, 0.18)');
            limbShade.addColorStop(1, 'rgba(3, 7, 18, 0.68)');
            ctx.fillStyle = limbShade;
            ctx.fillRect(-state.EARTH_RADIUS, -state.EARTH_RADIUS, state.EARTH_RADIUS * 2, state.EARTH_RADIUS * 2);

            if (state.game.earthShield > 0) {
                const shieldRatio = state.game.earthShield / state.game.earthMaxShield;
                ctx.strokeStyle = activePalette.shield + (0.24 * shieldRatio) + ')';
                ctx.lineWidth = 1.5 * state.gameScale;
                ctx.beginPath();
                ctx.arc(0, 0, state.EARTH_RADIUS - 1, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        function drawEarth(centerX, centerY) {
            ctx.save(); ctx.translate(centerX, centerY);
            const activePalette = PLANET_THEMES[state.activeThemeKey];
            if (state.game.earthShield > 0) {
                const shieldRatio = state.game.earthShield / state.game.earthMaxShield;
                const atmosphereAlpha = (0.15 + Math.abs(Math.sin(Date.now() / 900)) * 0.08) * shieldRatio;
                ctx.save();
                ctx.fillStyle = activePalette.shield + atmosphereAlpha + ')';
                ctx.beginPath(); ctx.arc(0, 0, state.EARTH_RADIUS + 18 * state.gameScale, 0, Math.PI * 2); ctx.fill();
                ctx.restore();

                const shieldPulse = Math.sin(Date.now() / 250) * 3 * state.gameScale;
                ctx.save(); ctx.strokeStyle = activePalette.shield + (0.3 + shieldRatio * 0.4) + ')';
                ctx.lineWidth = Math.max(0.5, 3.5 * shieldRatio) * state.gameScale;
                ctx.shadowBlur = 12; ctx.shadowColor = activePalette.coreStart;
                ctx.beginPath(); ctx.arc(0, 0, state.EARTH_RADIUS + 10 * state.gameScale + shieldPulse, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
            }
            state.earthRotation += 0.003;
            drawTexturedPlanetSurface(activePalette);
            ctx.restore();
        }

        function drawDamageOverlay(centerX, centerY) {
            if (state.game.shieldOverlayAlpha > 0 && state.screenShakeIntensity > 0) {
                ctx.save();
                ctx.globalAlpha = state.game.shieldOverlayAlpha;
                const grad = ctx.createRadialGradient(centerX, centerY, Math.min(canvas.width, canvas.height) * 0.3, centerX, centerY, Math.max(canvas.width, canvas.height) * 0.8);
                grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
                grad.addColorStop(1, `rgba(56, 189, 248, ${0.7 * state.screenShakeIntensity})`);
                ctx.fillStyle = grad;
                ctx.fillRect(-30, -30, canvas.width + 60, canvas.height + 60);
                ctx.restore();
                if (state.game.running && !state.game.paused) {
                    state.game.shieldOverlayAlpha -= 0.04;
                    if (state.game.shieldOverlayAlpha < 0) state.game.shieldOverlayAlpha = 0;
                }
            }

            let redAlpha = state.game.damageOverlayAlpha;
            let isCritical = false;

            if (state.game.mode === 'boss' && state.bossMode && state.bossMode.active) {
                if (state.bossMode.player.maxHp > 0 && state.bossMode.player.hp > 0 && (state.bossMode.player.hp / state.bossMode.player.maxHp) <= 0.3) isCritical = true;
            } else {
                if (state.game.earthMaxHealth > 0 && state.game.earthHealth > 0 && (state.game.earthHealth / state.game.earthMaxHealth) <= 0.3) isCritical = true;
            }

            if (isCritical) redAlpha = Math.max(redAlpha, 0.25 + Math.sin(Date.now() / 150) * 0.15);

            if (redAlpha > 0 && state.screenShakeIntensity > 0) {
                ctx.save();
                ctx.globalAlpha = redAlpha;
                const grad = ctx.createRadialGradient(centerX, centerY, Math.min(canvas.width, canvas.height) * 0.3, centerX, centerY, Math.max(canvas.width, canvas.height) * 0.8);
                grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
                grad.addColorStop(1, `rgba(239, 68, 68, ${0.7 * state.screenShakeIntensity})`);
                ctx.fillStyle = grad;
                ctx.fillRect(-30, -30, canvas.width + 60, canvas.height + 60);
                ctx.restore();
                if (state.game.running && !state.game.paused) {
                    state.game.damageOverlayAlpha -= 0.04;
                    if (state.game.damageOverlayAlpha < 0) state.game.damageOverlayAlpha = 0;
                }
            }
        }

        function getClosestSlot(mouseX, mouseY) {
            const centerX = canvas.width / 2; const centerY = canvas.height / 2;
            let closest = null; let minDist = 999999;
            for (let i = 0; i < state.ORBIT_PATHS.length; i++) {
                const radius = state.ORBIT_PATHS[i]; const maxSlots = state.orbitSlotCapacities[i];
                for (let s = 0; s < maxSlots; s++) {
                    const angle = state.orbitRotations[i] + s * (2 * Math.PI / maxSlots);
                    const sx = centerX + Math.cos(angle) * radius; const sy = centerY + Math.sin(angle) * radius;
                    const dist = Math.hypot(mouseX - sx, mouseY - sy);
                    if (dist < minDist) { minDist = dist; closest = { orbitIndex: i, slotIndex: s, x: sx, y: sy }; }
                }
            }
            return { closest, dist: minDist };
        }

        function getFirstEmptyDeployableSlot() {
            const centerX = canvas.width / 2; const centerY = canvas.height / 2;
            for (let orbitIndex = 0; orbitIndex < state.ORBIT_PATHS.length; orbitIndex++) {
                if (state.orbitLockStates[orbitIndex]) continue;
                const radius = state.ORBIT_PATHS[orbitIndex];
                const maxSlots = state.orbitSlotCapacities[orbitIndex];
                for (let slotIndex = 0; slotIndex < maxSlots; slotIndex++) {
                    if (state.game.towers.some(t => t.orbitIndex === orbitIndex && t.slotIndex === slotIndex)) continue;
                    const angle = state.orbitRotations[orbitIndex] + slotIndex * (2 * Math.PI / maxSlots);
                    return {
                        orbitIndex,
                        slotIndex,
                        x: centerX + Math.cos(angle) * radius,
                        y: centerY + Math.sin(angle) * radius
                    };
                }
            }
            return null;
        }

        function showOrbitExpansionPrompt() {
            showGameNotice('<i class="fa-solid fa-triangle-exclamation mr-1"></i> No empty orbit slots. Tap the Planet to add slots in Master Command.', 4200);
            if (!state.planetTutorialTooltipShown) state.tutorialHints.planet = true;
            suppressStarterTooltips(false);
        }

        function drawFirstDeploymentSlotGuide(slot) {
            if (!slot || state.firstDeploymentSlotHintShown || !state.game.selectedShopType) return;
            const labelX = Math.max(92, Math.min(canvas.width - 92, slot.x));
            const labelY = Math.max(84, slot.y - 72 * state.gameScale);
            const pulse = 0.5 + Math.abs(Math.sin(Date.now() / 180)) * 0.5;
            ctx.save();
            ctx.strokeStyle = `rgba(190, 242, 100, ${0.65 + pulse * 0.25})`;
            ctx.fillStyle = 'rgba(190, 242, 100, 0.08)';
            ctx.lineWidth = 2 * state.gameScale;
            ctx.shadowBlur = 16;
            ctx.shadowColor = '#bef264';
            ctx.beginPath();
            ctx.arc(slot.x, slot.y, (24 + pulse * 7) * state.gameScale, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#67e8f9';
            ctx.fillStyle = '#67e8f9';
            ctx.beginPath();
            ctx.moveTo(labelX, labelY + 20 * state.gameScale);
            ctx.lineTo(slot.x, slot.y - 20 * state.gameScale);
            ctx.stroke();
            const arrowAngle = Math.atan2(slot.y - 20 * state.gameScale - (labelY + 20 * state.gameScale), slot.x - labelX);
            ctx.beginPath();
            ctx.moveTo(slot.x, slot.y - 20 * state.gameScale);
            ctx.lineTo(slot.x - Math.cos(arrowAngle - 0.55) * 13 * state.gameScale, slot.y - 20 * state.gameScale - Math.sin(arrowAngle - 0.55) * 13 * state.gameScale);
            ctx.lineTo(slot.x - Math.cos(arrowAngle + 0.55) * 13 * state.gameScale, slot.y - 20 * state.gameScale - Math.sin(arrowAngle + 0.55) * 13 * state.gameScale);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 12;
            ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
            ctx.strokeStyle = 'rgba(103, 232, 249, 0.85)';
            const boxW = 132 * state.gameScale;
            const boxH = 30 * state.gameScale;
            ctx.fillRect(labelX - boxW / 2, labelY - boxH / 2, boxW, boxH);
            ctx.strokeRect(labelX - boxW / 2, labelY - boxH / 2, boxW, boxH);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#bae6fd';
            ctx.font = `900 ${Math.max(10, 12 * state.gameScale)}px Orbitron`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('DEPLOY HERE!', labelX, labelY);
            ctx.restore();
        }

        function isCoarsePointerInput() {
            return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        }

        function isMobileBuildView() {
            return window.innerWidth < 768;
        }

        function getSatelliteTapRadius() {
            return isCoarsePointerInput() ? 30 : 24;
        }

        function getSlotTapRadius() {
            return isCoarsePointerInput() ? 36 : 28;
        }

        function getPlanetTapRadius() {
            return state.EARTH_RADIUS + (isCoarsePointerInput() ? 8 : 25);
        }

        function calculateHoveredOrbitAndAngle(mouseX, mouseY) {
            const centerX = canvas.width / 2; const centerY = canvas.height / 2;
            const dist = Math.hypot(mouseX - centerX, mouseY - centerY);
            let matchedOrbitIndex = null; const threshold = 28 * state.gameScale;
            for (let i = 0; i < state.ORBIT_PATHS.length; i++) {
                if (Math.abs(dist - state.ORBIT_PATHS[i]) < threshold) { matchedOrbitIndex = i; break; }
            }
            if (matchedOrbitIndex !== null) {
                state.game.hoveredOrbit = state.ORBIT_PATHS[matchedOrbitIndex]; state.game.hoveredOrbitIndex = matchedOrbitIndex; state.game.hoveredAngle = Math.atan2(mouseY - centerY, mouseX - centerX);
            } else {
                state.game.hoveredOrbit = null; state.game.hoveredOrbitIndex = null;
            }
        }

        function checkTowerSelection(mouseX, mouseY) {
            const hitBox = getSatelliteTapRadius();
            let closestTower = null;
            let closestDist = hitBox;
            if (state.game && state.game.towers) {
                for (let t of state.game.towers) {
                    const dist = Math.hypot(t.x - mouseX, t.y - mouseY);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestTower = t;
                    }
                }
            }
            return closestTower;
        }

        function drawLightningArc(ctx, x1, y1, x2, y2) {
            ctx.save();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.8 * state.gameScale;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fbbf24';

            ctx.beginPath();
            ctx.moveTo(x1, y1);

            const steps = 4;
            for (let j = 1; j < steps; j++) {
                const ratio = j / steps;
                const px = x1 + (x2 - x1) * ratio;
                const py = y1 + (y2 - y1) * ratio;

                const offset = (Math.random() * 14 - 7) * state.gameScale;
                const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;

                ctx.lineTo(px + Math.cos(angle) * offset, py + Math.sin(angle) * offset);
            }

            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
        }

        function drawSpriteImage(image, x, y, maxSide, angle = 0) {
            if (!image || !image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) return false;
            const ratio = Math.min(maxSide / image.naturalWidth, maxSide / image.naturalHeight);
            const drawW = image.naturalWidth * ratio;
            const drawH = image.naturalHeight * ratio;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();
            return true;
        }

        function resetBossMode() {
            document.body.classList.remove('boss-mode-active');
            state.bossMode = {
                active: false, phase: 'idle', wave: 0, frame: 0, spawnTimer: 0, spawned: 0, requiredKills: 0, kills: 0,
                player: { x: canvas.width / 2, y: canvas.height - 120, hp: 100, maxHp: 100, fireCooldown: 0, dragging: false, dragOffsetX: 0, dragOffsetY: 0, targetX: canvas.width / 2, targetY: canvas.height - 120, weapon: 'default', repairKits: state.game && state.game.bossRepairKits ? state.game.bossRepairKits : 0, shieldUsed: false, shieldTimer: 0, invulnTimer: 0, lastTapTime: 0 }, gatekeeperSpawned: false,
                enemies: [], projectiles: [], enemyProjectiles: [], boss: null, rewardOptions: [], victoryTimer: 0, defeatedBossName: '', drops: []
            };
            updateRepairButton();
            const hud = document.getElementById('boss-mode-hud');
            const modal = document.getElementById('boss-card-modal');
            const failedModal = document.getElementById('boss-failed-modal');
            const actionPanel = document.getElementById('bottom-action-panel');
            if (hud) hud.classList.add('hidden');
            if (modal) modal.classList.add('hidden');
            if (failedModal) failedModal.classList.add('hidden');
            if (actionPanel) actionPanel.classList.remove('hidden');
        }

        function getBossPlayTop() {
            const hud = document.getElementById('boss-mode-hud');
            if (hud && !hud.classList.contains('hidden')) {
                const rect = hud.getBoundingClientRect();
                if (rect.height > 0) return rect.bottom + 52;
            }
            const viewportOffset = window.visualViewport ? window.visualViewport.offsetTop : 0;
            return viewportOffset + (isMobileBuildView() ? 132 : 118);
        }

        function startBossMode() {
            const bossIndex = state.game.isTimeAttack ? state.game.timeAttackBossIndex : Math.min(BOSS_SHIPS.length - 1, state.game.bossIndex);
            if (bossIndex < 0 || state.modeTransitionActive) return;
            const bossConfig = BOSS_SHIPS[bossIndex];
            state.waveActive = false;
            setWaveLaunchReady(false);
            setBuildControlEnabled(false);
            closeInspector(); closeOrbitInspector(); closeBlueprintDrawer();
            suppressStarterTooltips(true);
            document.body.classList.add('boss-mode-active');
            showModeTransition('Boss Intercept Mode', 'Manual fighter control engaged', 'fa-skull', 1450, () => {
                state.game.mode = 'boss';
                switchBgm('boss');
                state.bossMode.active = true;
                state.bossMode.phase = state.game.isTimeAttack ? 'boss' : 'minions';
                state.bossMode.wave = state.game.wave;
                state.bossMode.frame = 0;
                state.bossMode.spawnTimer = 0;
                state.bossMode.spawned = 0;
                state.bossMode.requiredKills = state.game.isTimeAttack ? 0 : bossConfig.minions;
                state.bossMode.kills = 0;
                state.bossMode.gatekeeperSpawned = false;
                state.bossMode.enemies = [];
                state.bossMode.projectiles = [];
                state.bossMode.enemyProjectiles = [];
                state.bossMode.drops = [];
                const playTop = getBossPlayTop();
                state.bossMode.player = { x: canvas.width / 2, y: canvas.height - 120, hp: 100, maxHp: 100, fireCooldown: 0, dragging: false, dragOffsetX: 0, dragOffsetY: 0, targetX: canvas.width / 2, targetY: canvas.height - 120, weapon: 'default', repairKits: state.game.bossRepairKits || 0, shieldUsed: false, shieldTimer: 0, invulnTimer: 0, lastTapTime: 0 };
                state.bossMode.player.spriteSize = 58 * state.gameScale;
                state.bossMode.player.hitRadius = state.bossMode.player.spriteSize * 0.08;
                state.bossMode.boss = {
                    config: bossConfig,
                    x: canvas.width / 2,
                    y: playTop + 46 * state.gameScale,
                    size: 42 * state.gameScale,
                    hp: Math.floor(bossConfig.maxHp * (1 + state.game.wave * 0.03)),
                    maxHp: Math.floor(bossConfig.maxHp * (1 + state.game.wave * 0.03)),
                    cooldown: bossConfig.fireRate,
                    drift: 0,
                    hitRadius: 42 * state.gameScale * (ENEMY_SPRITE_SCALE[bossConfig.name] || 7.2) * 0.34,
                    state: 'normal',
                    stateTimer: 0,
                    diveStartX: 0,
                    diveStartY: 0,
                    diveTargetX: 0
                };
                updateRepairButton();
                const hud = document.getElementById('boss-mode-hud');
                const title = document.getElementById('boss-mode-title');
                const timeAttackInfo = document.getElementById('boss-time-attack-info');
                const timeAttackSkill = document.getElementById('boss-time-attack-skill');
                const actionPanel = document.getElementById('bottom-action-panel');
                if (actionPanel) actionPanel.classList.add('hidden');
                if (hud) hud.classList.remove('hidden');
                if (title) title.innerText = `Boss Round ${state.game.wave}: ${bossConfig.name}`;
                if (timeAttackInfo && state.game.isTimeAttack) {
                    timeAttackInfo.classList.remove('hidden');
                    if (timeAttackSkill) timeAttackSkill.innerText = bossConfig.skill;
                } else if (timeAttackInfo) {
                    timeAttackInfo.classList.add('hidden');
                }
                showGameNotice(`<i class="fa-solid fa-skull mr-1"></i> Boss Intercept Mode Commencing`, 2600);
            });
        }

        function spawnBossMinion() {
            const playTop = getBossPlayTop();

            function spawnSingle(x, y) {
                const profiles = [ENEMY_PROFILES[4], ENEMY_PROFILES[5], ENEMY_PROFILES[0], ENEMY_PROFILES[1]];
                const profile = profiles[Math.floor(Math.random() * profiles.length)];
                const spriteScale = ENEMY_SPRITE_SCALE[profile.type] || 3.2;
                const size = profile.size * state.gameScale;
                state.bossMode.enemies.push({
                    type: profile.type,
                    category: profile.category,
                    color: profile.color,
                    x: Math.max(15, Math.min(canvas.width - 15, x)),
                    y: y,
                    size,
                    hitRadius: size * spriteScale * 0.34,
                    hp: Math.floor(profile.maxHp * (1 + state.game.wave * 0.05)),
                    maxHp: Math.floor(profile.maxHp * (1 + state.game.wave * 0.05)),
                    speed: (profile.speed + 0.18) * state.gameScale * 1.15,
                    damage: profile.damage,
                    cooldown: Math.floor(Math.random() * 60 + 60),
                    id: Math.random().toString(36).substring(2, 9),
                    sweepSpeed: Math.random() * 0.04 + 0.03,
                    sweepAmp: (Math.random() * 2 + 1.5) * state.gameScale
                });
                state.bossMode.spawned++;
            }

            const formationType = Math.random();
            const safeW = Math.max(100, canvas.width - 40); // Safe inner width

            if (formationType < 0.25) {
                const spread = Math.min(45 * state.gameScale, canvas.width * 0.2);
                const cx = Math.random() * (canvas.width - spread * 2 - 40) + spread + 20;
                spawnSingle(cx, playTop - 34);
                spawnSingle(cx - spread, playTop - 74 * state.gameScale);
                spawnSingle(cx + spread, playTop - 74 * state.gameScale);
            } else if (formationType < 0.50) {
                const spacing = safeW / 4;
                for (let i = 0; i < 4; i++) spawnSingle(20 + (spacing / 2) + (i * spacing), playTop - 34);
            } else if (formationType < 0.65) {
                const spread = Math.min(45 * state.gameScale, canvas.width * 0.2);
                const dir = Math.random() > 0.5 ? 1 : -1;
                const startX = Math.random() * (canvas.width - spread * 2 - 40) + (dir === 1 ? 20 : spread * 2 + 20);
                for (let i = 0; i < 3; i++) spawnSingle(startX + (i * spread * dir), playTop - 34 - (i * spread));
            } else {
                spawnSingle(Math.random() * safeW + 20, playTop - 34);
            }
        }

        function spawnGatekeeper() {
            const playTop = getBossPlayTop();
            const profile = ENEMY_PROFILES[6];
            const spriteScale = ENEMY_SPRITE_SCALE[profile.type] || 3.2;
            const size = profile.size * 1.5 * state.gameScale;
            state.bossMode.enemies.push({
                type: profile.type, category: 'gatekeeper', color: '#fbbf24',
                x: canvas.width / 2, y: playTop - 40 * state.gameScale, size, hitRadius: size * spriteScale * 0.34,
                hp: Math.floor(profile.maxHp * 4 * (1 + state.game.wave * 0.05)),
                maxHp: Math.floor(profile.maxHp * 4 * (1 + state.game.wave * 0.05)),
                speed: profile.speed * state.gameScale * 0.4, damage: profile.damage * 2, cooldown: 45,
                id: Math.random().toString(36).substring(2, 9), isGatekeeper: true
            });

            const escProfile = ENEMY_PROFILES[4];
            const eSize = escProfile.size * state.gameScale;
            const eHit = eSize * (ENEMY_SPRITE_SCALE[escProfile.type] || 3.2) * 0.34;
            const eHp = Math.floor(escProfile.maxHp * 2 * (1 + state.game.wave * 0.05));
            for (let i of [-1, 1]) {
                state.bossMode.enemies.push({
                    type: escProfile.type, category: 'ship', color: escProfile.color,
                    x: canvas.width / 2 + (50 * state.gameScale * i), y: playTop - 20 * state.gameScale,
                    size: eSize, hitRadius: eHit, hp: eHp, maxHp: eHp,
                    speed: escProfile.speed * state.gameScale * 0.6, damage: escProfile.damage, cooldown: 60,
                    sweepSpeed: 0.04, sweepAmp: 2 * state.gameScale,
                    id: Math.random().toString(36).substring(2, 9)
                });
            }
            showGameNotice('<i class="fa-solid fa-shield-halved mr-1"></i> Vanguard Gatekeeper detected!', 3000);
            playSynthSound('warning');
        }

        function fireBossProjectile(x, y, angle, speed, damage, color, radius) {
            const tunedSpeed = speed * 0.68;
            const r = radius || 6.5 * state.gameScale;
            state.bossMode.enemyProjectiles.push({ x, y, dx: Math.cos(angle) * tunedSpeed, dy: Math.sin(angle) * tunedSpeed, r, damage, color });
        }

        function getBossEnemyHitRadius(enemy) {
            return enemy.hitRadius || enemy.size * (ENEMY_SPRITE_SCALE[enemy.type] || 3.2) * 0.34;
        }

        function getBossHitRadius() {
            if (!state.bossMode.boss) return 0;
            return state.bossMode.boss.hitRadius || state.bossMode.boss.size * (ENEMY_SPRITE_SCALE[state.bossMode.boss.config.name] || 7.2) * 0.34;
        }

        function getPlayerFighterHitRadius() {
            return state.bossMode.player.hitRadius || 4.6 * state.gameScale;
        }

        function killBossModeEnemy(eIndex) {
            const enemy = state.bossMode.enemies[eIndex];
            
            if (enemy.category === 'gatekeeper') {
                createExplosion(enemy.x, enemy.y, enemy.color, 25);
                playSynthSound('ship_destroy');
                for (let i = 1; i <= 5; i++) {
                    setTimeout(() => {
                        if (!state.game.running || !state.bossMode.active) return;
                        createExplosion(enemy.x + (Math.random() - 0.5) * 80 * state.gameScale, enemy.y + (Math.random() - 0.5) * 80 * state.gameScale, '#fbbf24', 15);
                        playSynthSound('rock_destroy');
                    }, i * 250);
                }
            } else {
                createExplosion(enemy.x, enemy.y, enemy.color, 8);
                playSynthSound(enemy.category === 'normal' ? 'rock_destroy' : 'ship_destroy');
            }

            if ((enemy.category === 'ship' || enemy.category === 'miniboss' || enemy.category === 'gatekeeper') && Math.random() < (enemy.category === 'gatekeeper' ? 1.0 : 0.25)) {
                state.bossMode.drops.push({ x: enemy.x, y: enemy.y, type: 'weapon', enhancement: BOSS_WEAPON_ENHANCEMENTS[Math.floor(Math.random() * BOSS_WEAPON_ENHANCEMENTS.length)] });
            } else if (enemy.category === 'normal' && Math.random() < 0.10) {
                state.bossMode.drops.push({ x: enemy.x, y: enemy.y, type: 'repair' });
            }

            state.bossMode.enemies.splice(eIndex, 1);
            state.bossMode.kills++;
        }

        function collectDrop(drop) {
            if (drop.type === 'weapon') {
                state.bossMode.player.weapon = drop.enhancement;
                updateRepairButton();
                showGameNotice(`<i class="fa-solid fa-bolt text-purple-400"></i> Weapon Enhanced: ${drop.enhancement.toUpperCase()}`, 2000);
                playSynthSound('upgrade');
            } else if (drop.type === 'repair') {
                state.bossMode.player.repairKits++;
                updateRepairButton();
                showGameNotice(`<i class="fa-solid fa-wrench text-emerald-400"></i> Repair Kit Looted`, 2000);
                playSynthSound('upgrade');
            }
        }

        function updateBossMode() {
            state.bossMode.frame++;
            if (state.bossMode.phase === 'boss-defeated') {
                updateBossVictorySequence();
                return;
            }
            const player = state.bossMode.player;
            const playerTopLimit = getBossPlayTop() + 32;
            const playerBottomLimit = canvas.height - 40;
            if (typeof player.targetX !== 'number') player.targetX = player.x;
            if (typeof player.targetY !== 'number') player.targetY = player.y;
            player.targetX = Math.max(24, Math.min(canvas.width - 24, player.targetX));
            player.targetY = Math.max(playerTopLimit, Math.min(playerBottomLimit, player.targetY));
            const dragFollow = 0.24;

            if (player.shieldTimer > 0) {
                player.shieldTimer--;
                if (player.shieldTimer === 0) {
                    createExplosion(player.x, player.y, '#22d3ee', 25);
                    playSynthSound('hit');
                }
            }

            player.x += (player.targetX - player.x) * dragFollow;
            player.y += (player.targetY - player.y) * dragFollow;
            player.x = Math.max(24, Math.min(canvas.width - 24, player.x));
            player.y = Math.max(playerTopLimit, Math.min(playerBottomLimit, player.y));
            player.targetX = Math.max(24, Math.min(canvas.width - 24, player.targetX));
            player.targetY = Math.max(playerTopLimit, Math.min(playerBottomLimit, player.targetY));

            if (player.invulnTimer > 0) player.invulnTimer--;

            const shieldBtn = document.getElementById('btn-boss-shield');
            if (shieldBtn) {
                if (player.shieldUsed) {
                    shieldBtn.style.opacity = '0.3';
                    shieldBtn.style.background = '#0f172a';
                    shieldBtn.classList.remove('hover:bg-cyan-400', 'animate-pulse', 'ring-2', 'ring-cyan-200');
                    shieldBtn.style.cursor = 'not-allowed';
                } else {
                    shieldBtn.style.opacity = '1';
                    shieldBtn.style.background = '';
                    shieldBtn.classList.add('hover:bg-cyan-400', 'animate-pulse', 'ring-2', 'ring-cyan-200');
                    shieldBtn.style.cursor = '';
                }
            }

            const playerHitY = player.y + 2 * state.gameScale;

            if (player.fireCooldown > 0) player.fireCooldown--;
            if (player.fireCooldown <= 0) {
                const baseDamage = 18 + Math.floor(state.game.wave * 1.5);
                const baseDy = -7.2 * state.gameScale;
                const baseR = 5.5 * state.gameScale;
                const px = player.x;
                const py = player.y - 28 * state.gameScale;
                let cd = 10;

                switch (player.weapon) {
                    case 'twin':
                        state.bossMode.projectiles.push({ x: px - 10 * state.gameScale, y: py, dy: baseDy, r: baseR, damage: baseDamage });
                        state.bossMode.projectiles.push({ x: px + 10 * state.gameScale, y: py, dy: baseDy, r: baseR, damage: baseDamage });
                        break;
                    case 'spread':
                        state.bossMode.projectiles.push({ x: px, y: py, dx: -2 * state.gameScale, dy: baseDy * 0.9, r: baseR, damage: baseDamage });
                        state.bossMode.projectiles.push({ x: px, y: py, dx: 0, dy: baseDy, r: baseR, damage: baseDamage });
                        state.bossMode.projectiles.push({ x: px, y: py, dx: 2 * state.gameScale, dy: baseDy * 0.9, r: baseR, damage: baseDamage });
                        break;
                    case 'heavy':
                        state.bossMode.projectiles.push({ x: px, y: py, dy: baseDy * 0.7, r: baseR * 2.5, damage: baseDamage * 3 }); cd = 20; break;
                    case 'rapid':
                        state.bossMode.projectiles.push({ x: px, y: py, dy: baseDy * 1.2, r: baseR, damage: baseDamage * 0.8 }); cd = 4; break;
                    case 'homing':
                        state.bossMode.projectiles.push({ x: px, y: py, dy: baseDy, r: baseR, damage: baseDamage, homing: true }); break;
                    case 'explosive':
                        state.bossMode.projectiles.push({ x: px, y: py, dy: baseDy, r: baseR * 1.2, damage: baseDamage, explosive: true }); cd = 15; break;
                    case 'wave':
                        state.bossMode.projectiles.push({ x: px, y: py, dy: baseDy, r: baseR, damage: baseDamage, width: 80 * state.gameScale }); cd = 15; break;
                    case 'side':
                        state.bossMode.projectiles.push({ x: px, y: py, dy: baseDy, r: baseR, damage: baseDamage });
                        state.bossMode.projectiles.push({ x: px, y: py, dx: baseDy * 0.8, dy: 0, r: baseR, damage: baseDamage });
                        state.bossMode.projectiles.push({ x: px, y: py, dx: -baseDy * 0.8, dy: 0, r: baseR, damage: baseDamage });
                        break;
                    case 'ring':
                        for (let i = 0; i < 8; i++) { const angle = (i / 8) * Math.PI * 2; state.bossMode.projectiles.push({ x: px, y: py, dx: Math.cos(angle) * Math.abs(baseDy) * 0.8, dy: Math.sin(angle) * Math.abs(baseDy) * 0.8, r: baseR, damage: baseDamage }); } cd = 30; break;
                    case 'rear':
                        state.bossMode.projectiles.push({ x: px, y: py, dy: baseDy, r: baseR, damage: baseDamage });
                        state.bossMode.projectiles.push({ x: px, y: player.y + 28 * state.gameScale, dy: Math.abs(baseDy), r: baseR, damage: baseDamage });
                        break;
                    default:
                        state.bossMode.projectiles.push({ x: px, y: py, dy: baseDy, r: baseR, damage: baseDamage });
                }

                player.fireCooldown = cd;
                playSynthSound('laser');
            }

            if (state.bossMode.phase === 'minions') {
                const objective = document.getElementById('boss-mode-objective');
                const healthWrap = document.getElementById('boss-health-wrap');
                if (objective) {
                    if (state.bossMode.gatekeeperSpawned && state.bossMode.enemies.some(e => e.isGatekeeper)) {
                        objective.innerText = `Destroy Vanguard Gatekeeper`;
                    } else {
                        objective.innerText = `Clear Assault Wing ${state.bossMode.kills}/${state.bossMode.requiredKills}`;
                    }
                }
                if (healthWrap) healthWrap.classList.add('hidden');
                state.bossMode.spawnTimer--;
                if (state.bossMode.spawned < state.bossMode.requiredKills && state.bossMode.spawnTimer <= 0) {
                    spawnBossMinion();
                    state.bossMode.spawnTimer = Math.max(40, 85 - Math.floor(state.game.wave));
                }
                if (state.bossMode.spawned >= state.bossMode.requiredKills) {
                    if (!state.bossMode.gatekeeperSpawned && !state.game.isTimeAttack) {
                        state.bossMode.gatekeeperSpawned = true;
                        spawnGatekeeper();
                    } else if (state.bossMode.enemies.length === 0) {
                        if (state.bossMode.phase === 'minions') {
                            state.bossMode.phase = 'boss-approach';
                            state.bossMode.bossTimer = 180;
                            playSynthSound('warning');
                        }
                    }
                }
            } else if (state.bossMode.phase === 'boss-approach') {
                state.bossMode.bossTimer--;
                
                if (state.bossMode.boss) {
                    const finalY = getBossPlayTop() + 46 * state.gameScale;
                    const startY = -250 * state.gameScale;
                    
                    if (state.bossMode.bossTimer > 100) {
                        state.bossMode.boss.y = startY;
                    } else if (state.bossMode.bossTimer > 70) {
                        const dropProgress = 1 - ((state.bossMode.bossTimer - 70) / 30);
                        const easeIn = Math.pow(dropProgress, 3);
                        state.bossMode.boss.y = startY + (finalY - startY) * easeIn;
                    } else {
                        if (state.bossMode.bossTimer === 70) {
                            state.game.cameraShake = 45;
                            state.bossMode.flashAlpha = 1.0;
                            playSynthSound('earth_hit');
                            playSynthSound('explosion');
                            for (let i = 0; i < 12; i++) {
                                createExplosion(state.bossMode.boss.x + (Math.random()-0.5)*200, state.bossMode.boss.y + (Math.random()-0.5)*150, '#ef4444', 35);
                            }
                        }
                        state.bossMode.boss.y = finalY;
                        state.bossMode.boss.drift = (state.bossMode.boss.drift || 0) + 0.011;
                        state.bossMode.boss.x = canvas.width / 2 + Math.sin(state.bossMode.boss.drift) * canvas.width * 0.22;
                    }
                }

                if (state.bossMode.bossTimer <= 0) {
                    state.bossMode.phase = 'boss';
                    showGameNotice(`<i class="fa-solid fa-skull-crossbones mr-1"></i> ${state.bossMode.boss.config.name} has entered orbit`, 2400);
                }
            } else if (state.bossMode.phase === 'boss') {
                updateBossHud();
                const boss = state.bossMode.boss;

                if (boss.state === 'normal') {
                    boss.drift += 0.011;
                    boss.x = canvas.width / 2 + Math.sin(boss.drift) * canvas.width * 0.22;
                    boss.cooldown--;

                    if (boss.config.name === 'Dread Orchard' && state.bossMode.frame % 90 === 0) {
                        boss.hp = Math.min(boss.maxHp, boss.hp + 25);
                        createExplosion(boss.x, boss.y, '#10b981', 15);
                        boss.flashFrames = 15;
                    }
                    if ((boss.config.name === 'Gravemind Carrier' || boss.config.name === 'Eclipse Foundry') && state.bossMode.frame % 180 === 0) {
                        spawnBossMinion();
                        createExplosion(boss.x, boss.y, boss.config.color, 25);
                        boss.flashFrames = 15;
                    }

                    const baseAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
                    const projSpeed = (3.0 + state.game.wave * 0.045) * state.gameScale;
                    const projDamage = 12 + Math.floor(state.game.wave * 0.8);
                    const fireY = boss.y + 26 * state.gameScale;

                    if (boss.config.name === 'Abyss Regent' && state.bossMode.frame % 300 < 60 && state.bossMode.frame % 15 === 0) {
                        if (state.bossMode.frame % 300 === 0) { boss.flashFrames = 15; createExplosion(boss.x, fireY, '#ffffff', 30); playSynthSound('explosion'); }
                        for (let i = 0; i < 7; i++) fireBossProjectile(boss.x, fireY, baseAngle + (i - 3) * 0.15, projSpeed * 1.2, projDamage, boss.config.color);
                        playSynthSound('missile');
                    } else if (boss.config.name === 'Eclipse Foundry' && state.bossMode.frame % 240 === 0) {
                        boss.flashFrames = 15; createExplosion(boss.x, fireY, '#ffffff', 40); playSynthSound('explosion');
                        for (let i = 0; i < 12; i++) fireBossProjectile(boss.x, fireY, i * Math.PI / 6, projSpeed * 0.85, projDamage, boss.config.color);
                        playSynthSound('missile');
                    } else if (boss.config.name === 'Chronos Devourer' && state.bossMode.frame % 400 < 120 && state.bossMode.frame % 15 === 0) {
                        if (state.bossMode.frame % 400 === 0) { boss.flashFrames = 15; createExplosion(boss.x, fireY, '#ffffff', 30); playSynthSound('explosion'); }
                        boss.chronosAngle = (boss.chronosAngle || 0) + 0.18;
                        for (let i = 0; i < 8; i++) fireBossProjectile(boss.x, fireY, boss.chronosAngle + i * Math.PI / 4, projSpeed * 0.7, projDamage, boss.config.color);
                        playSynthSound('missile');
                    }

                    if (boss.cooldown <= 0) {
                        switch (boss.config.name) {
                            case 'Abyss Regent':
                                for (let i = 0; i < 3; i++) fireBossProjectile(boss.x, fireY, baseAngle + (i - 1) * 0.2, projSpeed, projDamage, boss.config.color);
                                boss.cooldown = boss.config.fireRate;
                                break;
                            case 'Gravemind Carrier':
                                fireBossProjectile(boss.x, fireY, baseAngle, projSpeed * 1.2, projDamage, boss.config.color, 8 * state.gameScale);
                                fireBossProjectile(boss.x - 20 * state.gameScale, fireY, baseAngle - 0.15, projSpeed * 0.9, projDamage, boss.config.color);
                                fireBossProjectile(boss.x + 20 * state.gameScale, fireY, baseAngle + 0.15, projSpeed * 0.9, projDamage, boss.config.color);
                                boss.cooldown = boss.config.fireRate;
                                break;
                            case 'Solar Warden':
                                if (!boss.burstCount) boss.burstCount = 0;
                                if (boss.burstCount === 0) { boss.flashFrames = 10; createExplosion(boss.x, fireY, '#ffffff', 15); }
                                for (let i = 0; i < 3; i++) fireBossProjectile(boss.x, fireY, baseAngle + (i - 1) * 0.1, projSpeed * 1.5, projDamage, boss.config.color);
                                boss.burstCount++;
                                if (boss.burstCount >= 3) {
                                    boss.cooldown = Math.floor(boss.config.fireRate * 1.5);
                                    boss.burstCount = 0;
                                } else {
                                    boss.cooldown = 12;
                                }
                                break;
                            case 'Null Engine':
                                boss.sweepAngle = (boss.sweepAngle || 0) + 0.4;
                                fireBossProjectile(boss.x, fireY, baseAngle + Math.sin(boss.sweepAngle) * 0.6, projSpeed * 1.8, Math.floor(projDamage * 0.7), boss.config.color);
                                boss.cooldown = Math.floor(boss.config.fireRate * 0.3);
                                break;
                            case 'Iron Basilica':
                                boss.flashFrames = 15; createExplosion(boss.x, fireY, '#94a3b8', 25);
                                fireBossProjectile(boss.x, fireY, baseAngle, projSpeed * 0.65, projDamage * 3, boss.config.color, 16 * state.gameScale);
                                boss.cooldown = Math.floor(boss.config.fireRate * 1.3);
                                break;
                            case 'Dread Orchard':
                                fireBossProjectile(boss.x, fireY, baseAngle, projSpeed, projDamage, boss.config.color);
                                for (let i = 0; i < 4; i++) fireBossProjectile(boss.x, fireY, baseAngle + Math.PI / 4 + i * Math.PI / 2, projSpeed * 0.6, projDamage, boss.config.color);
                                boss.cooldown = boss.config.fireRate;
                                break;
                            case 'Vortex Saint':
                                boss.spiralAngle = (boss.spiralAngle || 0) + 0.25;
                                for (let i = 0; i < 4; i++) fireBossProjectile(boss.x, fireY, boss.spiralAngle + i * Math.PI / 2, projSpeed * 0.85, projDamage, boss.config.color);
                                boss.cooldown = Math.floor(boss.config.fireRate * 0.45);
                                break;
                            case 'Eclipse Foundry':
                                fireBossProjectile(boss.x - 15 * state.gameScale, fireY, baseAngle - 0.2, projSpeed, projDamage, boss.config.color);
                                fireBossProjectile(boss.x + 15 * state.gameScale, fireY, baseAngle + 0.2, projSpeed, projDamage, boss.config.color);
                                boss.cooldown = boss.config.fireRate;
                                break;
                            case 'Omega Crucible':
                                const isRage = boss.hp < boss.maxHp * 0.5;
                                const shots = isRage ? 7 : 4;
                                const spread = isRage ? 0.12 : 0.18;
                                if (isRage) { boss.flashFrames = 5; createExplosion(boss.x, fireY, '#ef4444', 6); }
                                for (let i = 0; i < shots; i++) fireBossProjectile(boss.x, fireY, baseAngle + (i - (shots - 1) / 2) * spread, projSpeed * (isRage ? 1.4 : 1.0), projDamage, boss.config.color);
                                boss.cooldown = isRage ? Math.floor(boss.config.fireRate * 0.6) : boss.config.fireRate;
                                break;
                            case 'Chronos Devourer':
                                if (state.bossMode.frame % 400 >= 120) {
                                    for (let i = 0; i < 5; i++) fireBossProjectile(boss.x, fireY, baseAngle + (i - 2) * 0.1, projSpeed * 1.6, projDamage, boss.config.color);
                                }
                                boss.cooldown = Math.floor(boss.config.fireRate * 0.85);
                                break;
                            default:
                                for (let i = 0; i < 3; i++) fireBossProjectile(boss.x, fireY, baseAngle + (i - 1) * 0.15, projSpeed, projDamage, boss.config.color);
                                boss.cooldown = boss.config.fireRate;
                        }
                        playSynthSound('missile');
                    }

                    boss.stateTimer++;
                    if (boss.stateTimer > 500) {
                        boss.state = 'telegraph';
                        boss.stateTimer = 0;
                        boss.diveStartX = boss.x;
                        boss.diveStartY = boss.y;
                        boss.diveTargetX = player.x;
                        playSynthSound('warning');
                    }
                } else if (boss.state === 'telegraph') {
                    boss.stateTimer++;
                    if (boss.stateTimer > 60) {
                        boss.state = 'dive';
                        boss.stateTimer = 0;
                        playSynthSound('missile');
                    }
                } else if (boss.state === 'dive') {
                    boss.stateTimer++;
                    const diveDuration = 45;
                    const progress = boss.stateTimer / diveDuration;
                    boss.x = boss.diveStartX + (boss.diveTargetX - boss.diveStartX) * progress;
                    boss.y = boss.diveStartY + (canvas.height - boss.diveStartY) * progress;

                    if (boss.stateTimer >= diveDuration) {
                        boss.state = 'return';
                        boss.stateTimer = 0;
                        boss.diveStartX = boss.x;
                        boss.diveStartY = boss.y;
                    }
                } else if (boss.state === 'return') {
                    boss.stateTimer++;
                    const returnDuration = 50;
                    const progress = boss.stateTimer / returnDuration;
                    const targetY = getBossPlayTop() + 46 * state.gameScale;
                    boss.x = boss.diveStartX + (canvas.width / 2 - boss.diveStartX) * progress;
                    boss.y = boss.diveStartY + (targetY - boss.diveStartY) * progress;

                    if (boss.stateTimer >= returnDuration) {
                        boss.state = 'normal';
                        boss.stateTimer = 0;
                        boss.drift = 0;
                        boss.x = canvas.width / 2;
                        boss.y = targetY;
                    }
                }

                if (Math.hypot(player.x - boss.x, playerHitY - boss.y) < getBossHitRadius() + getPlayerFighterHitRadius()) {
                    if (!player.invulnTimer || player.invulnTimer <= 0) {
                        player.hp -= 35;
                        playSynthSound('earth_hit');
                        createExplosion(player.x, player.y, '#ef4444', 15);
                        player.invulnTimer = 60;
                        state.game.cameraShake = Math.min(25, (state.game.cameraShake || 0) + 12 * state.screenShakeIntensity);
                        state.game.damageOverlayAlpha = 0.8;
                        showGameNotice('<i class="fa-solid fa-triangle-exclamation mr-1"></i> Hull damaged by boss collision!', 2000);
                    }
                }

                if (boss.hp <= 0) handleBossDestroyed();
            }

            const bossTargetY = getBossPlayTop() + 46 * state.gameScale;

            for (let i = state.bossMode.enemies.length - 1; i >= 0; i--) {
                const enemy = state.bossMode.enemies[i];
                
                if (enemy.category === 'gatekeeper') {
                    if (enemy.y < bossTargetY) {
                        enemy.y += enemy.speed;
                    } else {
                        enemy.y = bossTargetY;
                        enemy.drift = (enemy.drift || 0) + 0.007;
                        enemy.x = canvas.width / 2 + Math.sin(enemy.drift) * canvas.width * 0.22;
                    }
                } else {
                    enemy.y += enemy.speed;
                }

                if (enemy.category === 'ship' || enemy.category === 'gatekeeper') {
                    if (enemy.category === 'ship') {
                        enemy.x += Math.sin(state.bossMode.frame * (enemy.sweepSpeed || 0.05) + enemy.id.charCodeAt(0)) * (enemy.sweepAmp || 2 * state.gameScale);
                        enemy.x = Math.max(15, Math.min(canvas.width - 15, enemy.x));
                    }
                    enemy.cooldown--;
                    if (enemy.cooldown <= 0) {
                        const isGk = enemy.category === 'gatekeeper';
                        const pSpeed = isGk ? 8 * state.gameScale : 6 * state.gameScale;
                        const pRadius = isGk ? 6 * state.gameScale : 4 * state.gameScale;
                        fireBossProjectile(enemy.x, enemy.y + enemy.size, Math.PI / 2, pSpeed, enemy.damage, enemy.color, pRadius);
                        if (isGk) {
                            fireBossProjectile(enemy.x - 15 * state.gameScale, enemy.y + enemy.size, Math.PI / 2 + 0.15, pSpeed * 0.9, enemy.damage, enemy.color, pRadius * 0.8);
                            fireBossProjectile(enemy.x + 15 * state.gameScale, enemy.y + enemy.size, Math.PI / 2 - 0.15, pSpeed * 0.9, enemy.damage, enemy.color, pRadius * 0.8);
                        }
                        enemy.cooldown = (isGk ? 75 : 120) + Math.floor(Math.random() * 60);
                        playSynthSound('laser');
                    }
                }

                if (Math.hypot(enemy.x - player.x, enemy.y - playerHitY) < getBossEnemyHitRadius(enemy) + getPlayerFighterHitRadius()) {
                    if (!player.invulnTimer || player.invulnTimer <= 0) {
                        player.hp -= enemy.damage;
                        player.invulnTimer = 30;
                        state.game.cameraShake = Math.min(15, (state.game.cameraShake || 0) + 6 * state.screenShakeIntensity);
                        state.game.damageOverlayAlpha = 0.6;
                    }
                    killBossModeEnemy(i);
                    playSynthSound('earth_hit');
                    continue;
                }
                if (enemy.y > canvas.height + 40) {
                    state.bossMode.enemies.splice(i, 1);
                }
            }

            for (let i = state.bossMode.projectiles.length - 1; i >= 0; i--) {
                const proj = state.bossMode.projectiles[i];
                if (proj.dx) proj.x += proj.dx;
                proj.y += proj.dy;

                if (proj.homing && state.bossMode.boss && state.bossMode.boss.hp > 0) {
                    const angle = Math.atan2(state.bossMode.boss.y - proj.y, state.bossMode.boss.x - proj.x);
                    const speed = Math.hypot(proj.dx || 0, proj.dy || 0) || 7.2 * state.gameScale;
                    proj.dx = Math.cos(angle) * speed;
                    proj.dy = Math.sin(angle) * speed;
                }

                let hit = false;
                for (let e = state.bossMode.enemies.length - 1; e >= 0; e--) {
                    const enemy = state.bossMode.enemies[e];
                    let collided = false;
                    if (proj.width) {
                        if (Math.abs(enemy.y - proj.y) < getBossEnemyHitRadius(enemy) + proj.r && Math.abs(enemy.x - proj.x) < getBossEnemyHitRadius(enemy) + proj.width / 2) collided = true;
                    } else if (Math.hypot(enemy.x - proj.x, enemy.y - proj.y) < getBossEnemyHitRadius(enemy) + proj.r) {
                        collided = true;
                    }

                    if (collided) {
                        enemy.hp -= proj.damage;
                        hit = true;
                        if (enemy.hp <= 0) {
                            killBossModeEnemy(e);
                        }
                        break;
                    }
                }
                if (!hit && state.bossMode.phase === 'boss' && state.bossMode.boss) {
                    let collided = false;
                    if (proj.width) {
                        if (Math.abs(state.bossMode.boss.y - proj.y) < getBossHitRadius() + proj.r && Math.abs(state.bossMode.boss.x - proj.x) < getBossHitRadius() + proj.width / 2) collided = true;
                    } else if (Math.hypot(state.bossMode.boss.x - proj.x, state.bossMode.boss.y - proj.y) < getBossHitRadius() + proj.r) {
                        collided = true;
                    }
                    if (collided) { state.bossMode.boss.hp -= proj.damage; hit = true; }
                }

                if (hit) {
                    if (proj.explosive) {
                        createExplosion(proj.x, proj.y, '#ef4444', 15);
                        const blastRadius = 60 * state.gameScale;
                        for (let e = state.bossMode.enemies.length - 1; e >= 0; e--) {
                            const enemy = state.bossMode.enemies[e];
                            if (Math.hypot(enemy.x - proj.x, enemy.y - proj.y) < blastRadius) {
                                enemy.hp -= proj.damage * 0.5;
                                if (enemy.hp <= 0) killBossModeEnemy(e);
                            }
                        }
                        if (state.bossMode.phase === 'boss' && state.bossMode.boss && Math.hypot(state.bossMode.boss.x - proj.x, state.bossMode.boss.y - proj.y) < getBossHitRadius() + blastRadius) state.bossMode.boss.hp -= proj.damage * 0.5;
                    }
                    state.bossMode.projectiles.splice(i, 1);
                } else if (proj.y < -20 || proj.x < -20 || proj.x > canvas.width + 20 || proj.y > canvas.height + 20) {
                    state.bossMode.projectiles.splice(i, 1);
                }
            }

            for (let i = state.bossMode.enemyProjectiles.length - 1; i >= 0; i--) {
                const proj = state.bossMode.enemyProjectiles[i];
                proj.x += proj.dx; proj.y += proj.dy;
                if (Math.hypot(player.x - proj.x, playerHitY - proj.y) < getPlayerFighterHitRadius() + proj.r) {
                    if (!player.invulnTimer || player.invulnTimer <= 0) {
                        player.hp -= proj.damage;
                        player.invulnTimer = 15;
                        state.game.cameraShake = Math.min(15, (state.game.cameraShake || 0) + 6 * state.screenShakeIntensity);
                        state.game.damageOverlayAlpha = 0.6;
                    }
                    state.bossMode.enemyProjectiles.splice(i, 1);
                } else if (proj.y > canvas.height + 30 || proj.x < -30 || proj.x > canvas.width + 30) {
                    state.bossMode.enemyProjectiles.splice(i, 1);
                }
            }

            for (let i = state.bossMode.drops.length - 1; i >= 0; i--) {
                const drop = state.bossMode.drops[i];
                drop.y += 2 * state.gameScale;

                if (Math.hypot(player.x - drop.x, playerHitY - drop.y) < getPlayerFighterHitRadius() + 30 * state.gameScale) {
                    collectDrop(drop);
                    state.bossMode.drops.splice(i, 1);
                } else if (drop.y > canvas.height + 30) {
                    state.bossMode.drops.splice(i, 1);
                }
            }

            if (player.hp <= 0) {
                failBossMission();
            }
        }

        function handleBossDestroyed() {
            const boss = state.bossMode.boss;
            if (!boss || boss.defeated) return;

            if (!state.game.isTimeAttack) {
                state.game.bossIndex++;
            }
            boss.defeated = true;
            state.bossMode.phase = 'boss-defeated';
            state.bossMode.victoryTimer = 0;
            state.bossMode.defeatedBossName = boss.config.name;
            state.bossMode.enemyProjectiles = [];
            state.bossMode.enemies = [];
            state.bossMode.projectiles = [];
            boss.defeatAlpha = 1;
            boss.defeatSpin = 0;
            playSynthSound('explosion');
            showGameNotice(`<i class="fa-solid fa-trophy mr-1"></i> Congratulations, you destroyed the ${boss.config.name}!`, 3600);
            createBossDeathBurst(boss.x, boss.y, boss.config.color, 1.85);
            state.bossMode.player.dragging = false;
            state.bossMode.player.targetX = state.bossMode.player.x;
            state.bossMode.player.targetY = state.bossMode.player.y;
        }

        function createBossDeathBurst(x, y, color, intensity = 1) {
            createExplosion(x, y, color, Math.floor(42 * intensity));
            createExplosion(x, y, '#fbbf24', Math.floor(28 * intensity));
            createExplosion(x, y, '#ffffff', Math.floor(16 * intensity));
            playSynthSound('explosion');
        }

        function updateBossVictorySequence() {
            const boss = state.bossMode.boss;
            const player = state.bossMode.player;
            state.bossMode.victoryTimer++;
            const explosionStageFrames = 138;

            if (boss) {
                boss.defeatSpin = (boss.defeatSpin || 0) + 0.026;
                boss.defeatAlpha = Math.max(0, 1 - Math.max(0, state.bossMode.victoryTimer - 42) / 150);
                if (state.bossMode.victoryTimer < explosionStageFrames && state.bossMode.victoryTimer % 4 === 0) {
                    const radius = getBossHitRadius() || 90 * state.gameScale;
                    const angle = Math.random() * Math.PI * 2;
                    const spread = (0.2 + Math.random() * 0.92) * radius;
                    const ex = boss.x + Math.cos(angle) * spread;
                    const ey = boss.y + Math.sin(angle) * spread * 0.62;
                    createBossDeathBurst(ex, ey, boss.config.color, state.bossMode.victoryTimer % 16 === 0 ? 0.92 : 0.46);
                }
            }

            if (state.bossMode.victoryTimer === explosionStageFrames) {
                showGameNotice(`<i class="fa-solid fa-shuttle-space mr-1"></i> Fighter wing returning to base with recovered command data`, 3800);
            }

            if (state.bossMode.victoryTimer > explosionStageFrames) {
                const flyTimer = state.bossMode.victoryTimer - explosionStageFrames;
                player.x += (canvas.width / 2 - player.x) * 0.065;
                player.y -= (2.4 + Math.min(7.2, flyTimer * 0.055)) * state.gameScale;
                player.targetX = player.x;
                player.targetY = player.y;

                if (flyTimer % 4 === 0) {
                    createExplosion(player.x, player.y + 34 * state.gameScale, '#67e8f9', 4);
                    createExplosion(player.x, player.y + 40 * state.gameScale, '#ffffff', 1);
                }
            }

            if (state.bossMode.victoryTimer === 78) {
                showGameNotice(`<i class="fa-solid fa-fire-flame-curved mr-1"></i> Boss hull rupture confirmed. Secondary detonations spreading.`, 3200);
            }

            if (state.bossMode.victoryTimer > 248 && state.bossMode.active && state.bossMode.phase === 'boss-defeated') {
                if (state.game.isTimeAttack) {
                    returnToTimeAttackMenu();
                } else {
                    openBossRewardCards();
                }
            }
        }

        function updateBossHud() {
            const healthWrap = document.getElementById('boss-health-wrap');
            const healthName = document.getElementById('boss-health-name');
            const healthText = document.getElementById('boss-health-text');
            const healthBar = document.getElementById('boss-health-bar');
            const objective = document.getElementById('boss-mode-objective');
            if (!state.bossMode.boss) return;
            if (healthWrap) healthWrap.classList.remove('hidden');
            if (healthName) healthName.innerText = state.bossMode.boss.config.name;

            const BARS = 4;
            const hpPerBar = state.bossMode.boss.maxHp / BARS;
            const currentBarIndex = Math.floor(Math.max(0, state.bossMode.boss.hp - 1) / hpPerBar);
            const currentBarHp = state.bossMode.boss.hp - (currentBarIndex * hpPerBar);
            const pct = Math.max(0, currentBarHp / hpPerBar);

            if (healthText) healthText.innerText = `x${currentBarIndex + 1} ${Math.ceil(pct * 100)}%`;
            if (healthBar) {
                healthBar.style.width = `${pct * 100}%`;
                const layerColors = [
                    'bg-gradient-to-r from-red-600 to-amber-400', 'bg-gradient-to-r from-amber-500 to-emerald-400',
                    'bg-gradient-to-r from-emerald-500 to-cyan-400', 'bg-gradient-to-r from-cyan-500 to-purple-500'
                ];
                healthBar.className = `h-full w-full transition-all duration-150 ${layerColors[Math.min(BARS - 1, currentBarIndex)] || layerColors[0]}`;
            }
            if (objective) objective.innerText = state.game.isTimeAttack ? 'Time Attack' : state.bossMode.boss.config.skill;
        }

        function updateRepairButton() {
            const btnRepair = document.getElementById('btn-boss-repair');
            const btnWeapon = document.getElementById('btn-boss-weapon-remove');
            const btnShield = document.getElementById('btn-boss-shield');
            const count = document.getElementById('boss-repair-count');
            const panel = document.getElementById('boss-action-panel');
            if (state.bossMode.active) {
                panel.classList.remove('hidden');
                if (state.bossMode.player.repairKits > 0) {
                    if (btnRepair) btnRepair.classList.remove('hidden');
                    if (count) count.innerText = state.bossMode.player.repairKits;
                } else {
                    if (btnRepair) btnRepair.classList.add('hidden');
                }

                if (state.bossMode.player.weapon !== 'default') {
                    if (btnWeapon) btnWeapon.classList.remove('hidden');
                } else {
                    if (btnWeapon) btnWeapon.classList.add('hidden');
                }
                if (btnShield) btnShield.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        }

        function failBossMission() {
            if (state.bossMode.phase === 'failed') return;
            state.bossMode.phase = 'failed';
            state.bossMode.player.dragging = false;
            state.bossMode.enemies = [];
            state.bossMode.projectiles = [];
            state.bossMode.enemyProjectiles = [];

            state.game.bossRepairKits = 0;

            if (state.game.isTimeAttack) {
                playSynthSound('earth_hit');
                returnToTimeAttackMenu();
                return;
            }

            const failedModal = document.getElementById('boss-failed-modal');
            const hud = document.getElementById('boss-mode-hud');
            const cardModal = document.getElementById('boss-card-modal');
            if (hud) hud.classList.add('hidden');
            if (cardModal) cardModal.classList.add('hidden');
            if (failedModal) failedModal.classList.remove('hidden');
            playSynthSound('earth_hit');
        }

        function returnToTimeAttackMenu() {
            if (state.modeTransitionActive) return;
            showModeTransition('Time Attack Complete', 'Returning to test menu', 'fa-skull-crossbones', 1450, () => {
                state.bossMode.active = false;
                state.bossMode.phase = 'idle';
                state.game.mode = 'defense';
                state.game.running = false;
                document.body.classList.remove('boss-mode-active');
                switchBgm('default');
                resetBossMode();

                const introModal = document.getElementById('intro-modal');
                if (introModal) introModal.classList.remove('hidden');

                hideTitleSubpanels();
                populateBossAttackPanel();
                const panel = document.getElementById('inline-boss-attack-options');
                if (panel) panel.classList.remove('hidden');
            });
        }

        function returnToBaseAfterBossFailure() {
            if (state.modeTransitionActive) return;
            const failedModal = document.getElementById('boss-failed-modal');
            showModeTransition('Returning To Defense Grid', 'Orbital command restored', 'fa-satellite', 1450, () => {
                state.game.mode = 'defense';
                switchBgm('default');
                resetBossMode();
                setBuildControlEnabled(true);
                suppressStarterTooltips(false);
                state.game.wave++;
                const wDisp = document.getElementById('wave-display'); if (wDisp) wDisp.innerText = state.game.wave;
                const mWDisp = document.getElementById('mobile-wave'); if (mWDisp) mWDisp.innerText = state.game.wave;
                setWaveLaunchReady(true);
                showGameNotice('<i class="fa-solid fa-wrench mr-1"></i> Returned to base. Command systems repaired.', 3200);
            });
        }

        function drawBossMode() {
            const player = state.bossMode.player;
            for (const proj of state.bossMode.projectiles) {
                ctx.save(); ctx.fillStyle = '#67e8f9'; ctx.shadowBlur = 8; ctx.shadowColor = '#67e8f9';
                if (proj.width) {
                    ctx.fillRect(proj.x - proj.width / 2, proj.y - proj.r, proj.width, proj.r * 2);
                } else {
                    ctx.beginPath(); ctx.arc(proj.x, proj.y, proj.r, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            }
            for (const proj of state.bossMode.enemyProjectiles) {
                ctx.save(); ctx.fillStyle = proj.color; ctx.shadowBlur = 10; ctx.shadowColor = proj.color; ctx.beginPath(); ctx.arc(proj.x, proj.y, proj.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            }
            for (const enemy of state.bossMode.enemies) {
                if (!drawEnemySprite(ctx, enemy.type, enemy.x, enemy.y, enemy.size, Math.PI / 2)) {
                    ctx.fillStyle = enemy.color; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2); ctx.fill();
                }
                if (enemy.isGatekeeper && enemy.hp < enemy.maxHp) {
                    const barW = enemy.size * 2; const barH = 3 * state.gameScale;
                    ctx.save();
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'; ctx.fillRect(enemy.x - barW / 2, enemy.y - enemy.size - 8 * state.gameScale, barW, barH);
                    ctx.fillStyle = '#10b981'; ctx.fillRect(enemy.x - barW / 2, enemy.y - enemy.size - 8 * state.gameScale, barW * (enemy.hp / enemy.maxHp), barH);
                    ctx.restore();
                }
            }
            if ((state.bossMode.phase === 'boss' || state.bossMode.phase === 'boss-approach') && state.bossMode.boss) {
                if (state.bossMode.boss.state === 'telegraph') {
                    ctx.save();
                    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ef4444';
                    const targetX = state.bossMode.boss.diveTargetX;
                    const w = state.bossMode.boss.size * 1.5;

                    ctx.beginPath();
                    ctx.moveTo(state.bossMode.boss.x - w / 2, state.bossMode.boss.y);
                    ctx.lineTo(state.bossMode.boss.x + w / 2, state.bossMode.boss.y);
                    ctx.lineTo(targetX + w / 2, canvas.height);
                    ctx.lineTo(targetX - w / 2, canvas.height);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
                    ctx.lineWidth = 2 * state.gameScale;
                    ctx.setLineDash([15, 10]);
                    ctx.lineDashOffset = -((Date.now() / 20) % 25);
                    ctx.beginPath(); ctx.moveTo(state.bossMode.boss.x, state.bossMode.boss.y); ctx.lineTo(targetX, canvas.height); ctx.stroke();
                    ctx.restore();
                }
                if (state.bossMode.boss.flashFrames > 0) {
                    ctx.save();
                    ctx.shadowBlur = 30;
                    ctx.shadowColor = state.bossMode.boss.config.color;
                    ctx.globalAlpha = Math.min(1, state.bossMode.boss.flashFrames / 15);
                    ctx.globalCompositeOperation = 'screen';
                    drawEnemySprite(ctx, state.bossMode.boss.config.name, state.bossMode.boss.x, state.bossMode.boss.y, state.bossMode.boss.size * 1.15, Math.PI / 2);
                    ctx.restore();
                    state.bossMode.boss.flashFrames--;
                }
                drawEnemySprite(ctx, state.bossMode.boss.config.name, state.bossMode.boss.x, state.bossMode.boss.y, state.bossMode.boss.size, Math.PI / 2);
            } else if (state.bossMode.phase === 'boss-defeated' && state.bossMode.boss && (state.bossMode.boss.defeatAlpha || 0) > 0) {
                ctx.save();
                ctx.globalAlpha = state.bossMode.boss.defeatAlpha;
                drawEnemySprite(ctx, state.bossMode.boss.config.name, state.bossMode.boss.x, state.bossMode.boss.y, state.bossMode.boss.size, Math.PI / 2 + (state.bossMode.boss.defeatSpin || 0));
                ctx.restore();
            }
            const playerSpriteSize = player.spriteSize || 58 * state.gameScale;
            const playerHitY = player.y + 2 * state.gameScale;
            const isInvuln = player.invulnTimer > 0 && player.shieldTimer <= 0;
            if (!isInvuln || state.bossMode.frame % 10 < 5) {
                if (!drawSpriteImage(playerFighterSprite, player.x, player.y, playerSpriteSize, 0)) {
                    ctx.save(); ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.moveTo(player.x, player.y - 24 * state.gameScale); ctx.lineTo(player.x - 18 * state.gameScale, player.y + 20 * state.gameScale); ctx.lineTo(player.x + 18 * state.gameScale, player.y + 20 * state.gameScale); ctx.closePath(); ctx.fill(); ctx.restore();
                }

                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
                ctx.shadowBlur = 5;
                ctx.shadowColor = '#38bdf8';
                ctx.beginPath();
                ctx.arc(player.x, playerHitY, getPlayerFighterHitRadius(), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            if (player.shieldTimer > 0) {
                ctx.save();
                ctx.strokeStyle = '#22d3ee';
                ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
                ctx.lineWidth = 2 * state.gameScale;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#22d3ee';
                ctx.beginPath();
                ctx.arc(player.x, player.y, playerSpriteSize * 0.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            if (state.bossMode.phase !== 'boss-defeated') {
                ctx.save();
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fillRect(player.x - 34 * state.gameScale, player.y + 34 * state.gameScale, 68 * state.gameScale, 5 * state.gameScale);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(player.x - 34 * state.gameScale, player.y + 34 * state.gameScale, 68 * state.gameScale * (player.hp / player.maxHp), 5 * state.gameScale);
                ctx.restore();
            }
            for (const drop of state.bossMode.drops) {
                ctx.save();
                if (drop.type === 'weapon') {
                    ctx.fillStyle = '#a855f7';
                    ctx.shadowColor = '#a855f7';
                    ctx.shadowBlur = 10;
                    ctx.beginPath(); ctx.arc(drop.x, drop.y, 16 * state.gameScale, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.font = `bold ${18 * state.gameScale}px sans-serif`;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.shadowBlur = 0;
                    ctx.fillText('W', drop.x, drop.y);
                } else if (drop.type === 'repair') {
                    ctx.fillStyle = '#10b981'; ctx.shadowColor = '#10b981'; ctx.shadowBlur = 10;
                    ctx.fillRect(drop.x - 14 * state.gameScale, drop.y - 14 * state.gameScale, 28 * state.gameScale, 28 * state.gameScale);
                    ctx.fillStyle = '#fff'; ctx.shadowBlur = 0;
                    ctx.fillRect(drop.x - 4 * state.gameScale, drop.y - 10 * state.gameScale, 8 * state.gameScale, 20 * state.gameScale);
                    ctx.fillRect(drop.x - 10 * state.gameScale, drop.y - 4 * state.gameScale, 20 * state.gameScale, 8 * state.gameScale);
                }
                ctx.restore();
            }
            if (state.bossMode.flashAlpha > 0) {
                ctx.save();
                ctx.fillStyle = `rgba(255, 255, 255, ${state.bossMode.flashAlpha})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
                state.bossMode.flashAlpha -= 0.03;
            }
        }

        function openBossRewardCards() {
            state.bossMode.phase = 'reward';
            const eligible = COMMAND_DIRECTIVES.filter(directive => getDirectiveLevel(directive.id) < 5);
            const shuffled = [];
            const pool = [...eligible];
            while (shuffled.length < 3 && pool.length > 0) {
                const totalWeight = pool.reduce((sum, directive) => sum + (DIRECTIVE_RARITY_WEIGHTS[directive.rarity] || 1), 0);
                let roll = Math.random() * totalWeight;
                let selectedIndex = 0;
                for (let i = 0; i < pool.length; i++) {
                    roll -= DIRECTIVE_RARITY_WEIGHTS[pool[i].rarity] || 1;
                    if (roll <= 0) { selectedIndex = i; break; }
                }
                shuffled.push(pool.splice(selectedIndex, 1)[0]);
            }
            state.bossMode.rewardOptions = shuffled;
            const modal = document.getElementById('boss-card-modal');
            const container = document.getElementById('boss-card-options');
            const victoryTitle = document.getElementById('boss-victory-title');
            const victoryStory = document.getElementById('boss-victory-story');
            if (!modal || !container) return;
            const bossName = state.bossMode.defeatedBossName || (state.bossMode.boss && state.bossMode.boss.config.name) || 'Boss Ship';
            if (victoryTitle) victoryTitle.innerText = `Congratulations, Commander. ${bossName} Has Been Destroyed.`;
            if (victoryStory) victoryStory.innerText = getBossVictoryStory(bossName);
            container.innerHTML = shuffled.map(card => {
                const currentLevel = getDirectiveLevel(card.id);
                const nextLevel = Math.min(5, currentLevel + 1);
                return `<button class="boss-reward-card bg-slate-950 hover:bg-slate-900 border border-amber-500/40 rounded-xl p-3 text-left transition-all active:scale-95" data-card-id="${card.id}">
                <div class="flex justify-between items-start gap-2">
                    <div class="text-xs font-black uppercase tracking-widest" style="color:${card.color}">${card.name}</div>
	                    <div class="text-[9px] text-amber-300 font-black">LVL ${nextLevel}</div>
                </div>
	                <div class="text-[9px] text-slate-500 uppercase tracking-widest mt-1">${card.rarity}</div>
	                <div class="text-[10px] text-slate-300 mt-2 leading-snug font-semibold">${getDirectiveDescription(card, nextLevel)}</div>
	            </button>`;
            }).join('');
            modal.classList.remove('boss-card-energy');
            modal.classList.remove('hidden');
            modal.offsetHeight;
            modal.classList.add('boss-card-energy');
            document.querySelectorAll('.boss-reward-card').forEach(btn => {
                btn.addEventListener('pointerdown', e => {
                    e.preventDefault();
                    const card = state.bossMode.rewardOptions.find(item => item.id === btn.dataset.cardId);
                    if (card) chooseBossRewardCard(card);
                }, { once: true });
            });
        }

        function getBossVictoryStory(bossName) {
            const stories = {
                'Abyss Regent': 'Its crimson command signal collapsed into static, scattering the raider formation and leaving recoverable directive data in the debris field.',
                'Gravemind Carrier': 'With the carrier core ruptured, its swarm network went silent and allied salvage teams secured the remaining drone-control archives.',
                'Solar Warden': 'The thermal siege array burned out above orbit, opening a clean corridor for your fighter wing to return with intact targeting records.',
                'Null Engine': 'The needle barrage generator imploded, restoring sensor clarity across the defense grid and exposing encrypted command fragments.',
                'Iron Basilica': 'The armored cathedral broke apart plate by plate, proving the orbital line can crack even the heaviest invader hulls.',
                'Dread Orchard': 'Its regenerative bio-reactors overgrew and detonated, leaving behind volatile growth maps that command can repurpose.',
                'Vortex Saint': 'The spiral cannon lost containment, pulling hostile escorts into its own wake before the fighter wing escaped northbound.',
                'Eclipse Foundry': 'The drone foundry cooled into a dead husk, ending its production cycle and freeing the planet from immediate escort pressure.',
                'Omega Crucible': 'Its rage core overloaded under sustained fire, throwing molten wreckage across the upper atmosphere as command recovered battle telemetry.',
                'Chronos Devourer': 'The final speed storm fractured, time-distortion readings stabilized, and base command confirmed a rare directive cache in the wreck.'
            };
            return stories[bossName] || 'The enemy command vessel broke apart above orbit. Your fighter wing returned to base with recovered tactical data ready for directive selection.';
        }

        function chooseBossRewardCard(card) {
            if (state.modeTransitionActive) return;
            const previousLevel = getDirectiveLevel(card.id);
            const newLevel = Math.min(5, previousLevel + 1);
            state.game.commandDirectives[card.id] = newLevel;
            state.game.bossRepairKits = state.bossMode.player.repairKits;
            applyDirectiveLevelUp(card, previousLevel, newLevel);
            state.cosmicData += 20 * state.game.wave; saveSettings();
            const modal = document.getElementById('boss-card-modal');
            const hud = document.getElementById('boss-mode-hud');
            if (hud) hud.classList.add('hidden');
            state.bossMode.phase = 'transition';
            showModeTransition('Returning To Defense Grid', 'Command Directive uploaded', 'fa-satellite', 1450, () => {
                state.game.mode = 'defense';
                switchBgm('default');
                resetBossMode();
                setBuildControlEnabled(true);
                suppressStarterTooltips(false);
                state.game.wave++;
                const wDisp = document.getElementById('wave-display'); if (wDisp) wDisp.innerText = state.game.wave;
                const mWDisp = document.getElementById('mobile-wave'); if (mWDisp) mWDisp.innerText = state.game.wave;
                setWaveLaunchReady(true);
                addGold(600 + state.game.wave * 30);
                showGameNotice(`<i class="fa-solid fa-layer-group mr-1"></i> Directive: ${card.name} LVL ${newLevel}<br><i class="fa-solid fa-star text-purple-400 mt-1"></i> Recovered ${20 * (state.game.wave - 1)} Cosmic Data!`, 4000);
            });
        }

        function handleEnemyCollisions(enemy, i) {
            const centerX = canvas.width / 2; const centerY = canvas.height / 2;
            const distToCenter = Math.hypot(centerX - enemy.x, centerY - enemy.y);

            if (enemy.category === 'normal') {
                let impactedTower = null;
                for (const tower of state.game.towers) {
                    const impactDistance = enemy.size + 16 * state.gameScale;
                    if (Math.hypot(tower.x - enemy.x, tower.y - enemy.y) <= impactDistance) {
                        impactedTower = tower;
                        break;
                    }
                }
                if (impactedTower) {
                    const impactDamage = enemy.baseDamage + Math.max(0, Math.ceil(enemy.hp));
                    damageSatellite(impactedTower, impactDamage, enemy.category);
                    createExplosion(enemy.x, enemy.y, enemy.color, 14);
                    playSynthSound('explosion');
                    state.game.enemies.splice(i, 1);
                    return;
                }
            }

            if (distToCenter < state.EARTH_RADIUS + 8) {
                createExplosion(enemy.x, enemy.y, enemy.color, 12);
                const damageMultiplier = Math.max(0.15, 1 - getDirectiveEffectValue('coreDamageReduction', 0) + (getDirectiveEffectValue('corePowered') ? getDirectiveEffectValue('corePowered').taken : 0));
                const incomingDamage = Math.max(1, Math.floor(enemy.damage * damageMultiplier));
                const shieldBeforeHit = state.game.earthShield;
                if (state.game.earthShield > 0) {
                    const remainingDamage = Math.max(0, incomingDamage - state.game.earthShield);
                    state.game.earthShield = Math.max(0, state.game.earthShield - incomingDamage);
                    if (remainingDamage > 0) {
                        state.game.earthHealth = Math.max(0, state.game.earthHealth - remainingDamage);
                        state.game.cameraShake = Math.min(25, (state.game.cameraShake || 0) + 12 * state.screenShakeIntensity);
                        state.game.damageOverlayAlpha = 0.8;
                    } else {
                        state.game.cameraShake = Math.min(10, (state.game.cameraShake || 0) + 3 * state.screenShakeIntensity);
                        state.game.shieldOverlayAlpha = 0.8;
                    }
                    playSynthSound(remainingDamage > 0 ? 'earth_hit' : 'shield_deflect');
                } else {
                    state.game.earthHealth = Math.max(0, state.game.earthHealth - incomingDamage); state.game.cameraShake = Math.min(25, (state.game.cameraShake || 0) + 12 * state.screenShakeIntensity); state.game.damageOverlayAlpha = 0.8; playSynthSound('earth_hit');
                }
                if (shieldBeforeHit > 0 && state.game.earthShield <= 0) {
                    const shockDamage = getDirectiveEffectValue('shieldBreakDamage', 0);
                    if (shockDamage) {
                        for (const e of state.game.enemies) {
                            e.hp -= shockDamage;
                            if (shockDamage >= 320) {
                                e.slowMultiplier = Math.min(e.slowMultiplier, shockDamage >= 460 ? 0.35 : 0.55);
                                e.slowTimer = Math.max(e.slowTimer, 180);
                            }
                        }
                        createExplosion(centerX, centerY, '#67e8f9', 35);
                    }
                }
                syncPlanetBars();

                state.game.enemies.splice(i, 1);

                if (state.game.earthHealth <= 0) {
                    state.game.running = false;
                    const finalWave = document.getElementById('final-wave'); const finalScore = document.getElementById('final-score');
                    const finalTowers = document.getElementById('final-towers'); const gameoverModal = document.getElementById('gameover-modal');
                    if (finalWave) finalWave.innerText = state.game.wave;
                    if (finalScore) finalScore.innerText = state.game.score;
                    if (finalTowers) finalTowers.innerText = state.game.towersBuiltCount;
                    if (gameoverModal) gameoverModal.classList.remove('hidden');
                }
                return;
            }

            if (enemy.hp <= 0) {
                createExplosion(enemy.x, enemy.y, enemy.color, 16);
                playSynthSound(enemy.category === 'normal' ? 'rock_destroy' : 'ship_destroy');
                let rewardMultiplier = 1;
                const riskContract = getDirectiveEffectValue('riskContract'); if (riskContract) rewardMultiplier += riskContract.reward;
                const rewardHpTradeoff = getDirectiveEffectValue('rewardHpTradeoff'); if (rewardHpTradeoff) rewardMultiplier += rewardHpTradeoff.reward;
                const rockRewardSpeed = getDirectiveEffectValue('rockRewardSpeed'); if (enemy.category === 'normal' && rockRewardSpeed) rewardMultiplier += rockRewardSpeed.reward;
                const shipReward = getDirectiveEffectValue('shipReward'); if ((enemy.category === 'ship' || enemy.category === 'miniboss') && shipReward) rewardMultiplier += shipReward;
                const eliteIncentive = getDirectiveEffectValue('eliteIncentive'); if (enemy.category === 'miniboss' && eliteIncentive) rewardMultiplier *= eliteIncentive.reward;
                const reward = Math.floor(enemy.goldReward * rewardMultiplier);
                addGold(reward); state.game.score += reward * 2;
                const shieldPerKill = getDirectiveEffectValue('shieldPerKill', 0);
                const fragileShield = getDirectiveEffectValue('fragileShield');
                const shieldGain = shieldPerKill + (fragileShield ? fragileShield.shieldKill : 0);
                if (shieldGain > 0 && state.game.hazard !== 'Ion Storm') {
                    state.game.earthShield = Math.min(state.game.earthMaxShield, state.game.earthShield + shieldGain);
                    syncPlanetBars();
                }
                const scrap = getDirectiveEffectValue('scrapEveryKills');
                if (scrap) {
                    state.game.directiveKills++;
                    if (state.game.directiveKills % scrap.kills === 0) addGold(scrap.gold);
                }
                const scoreDisplay = document.getElementById('score-display');
                if (scoreDisplay) scoreDisplay.innerText = state.game.score;

                if (enemy.type === 'Rogue Comet') {
                    state.cosmicData += 15;
                    showGameNotice('<i class="fa-solid fa-star text-purple-400"></i> Recovered 15 Cosmic Data!', 3000);
                    saveSettings();
                } else if (enemy.type === 'Smuggler Ship') {
                    state.cosmicData += 5;
                    const pool = COMMAND_DIRECTIVES.filter(d => getDirectiveLevel(d.id) < 5);
                    if (pool.length > 0) {
                        const card = pool[Math.floor(Math.random() * pool.length)];
                        const prev = getDirectiveLevel(card.id);
                        const next = prev + 1;
                        state.game.commandDirectives[card.id] = next;
                        applyDirectiveLevelUp(card, prev, next);
                        showGameNotice(`<i class="fa-solid fa-layer-group text-amber-400"></i> Smuggler Data Recovered: ${card.name} LVL ${next}`, 4000);
                    }
                    saveSettings();
                }

                state.game.enemies.splice(i, 1);
            }
        }

        // ----------------------------------------------------------------------
        // 8. GAME FLOW CONTROLLERS
        // ----------------------------------------------------------------------
        function startNextWave() {
            if (state.waveActive || state.game.paused || state.modeTransitionActive) return;
            if (state.game.wave === 1 && state.game.towers.length === 0) {
                showGameNotice('<i class="fa-solid fa-triangle-exclamation mr-1"></i> Deploy at least one satellite before starting Wave 1');
                const hint = document.getElementById('action-hint');
                if (hint) hint.innerHTML = `<span class="text-red-300 font-bold">Build one satellite before launching the first wave.</span>`;
                setWaveLaunchReady(true);
                return;
            }
            suppressStarterTooltips(true);
            if (isBossWave(state.game.wave)) {
                startBossMode();
                return;
            }
            state.waveActive = true;
            setWaveLaunchReady(false);
            setBuildControlEnabled(false);
            if (state.game.selectedShopType) cancelBuildMode();
            closeBlueprintDrawer();
            if (state.game.selectedTower) selectTower(state.game.selectedTower);
            updateOrbitInspectorUI();

            let isMiniBossWave = state.game.wave >= 3 && state.game.wave % 3 === 0;
            let isThematic = state.game.wave > 5 && Math.random() < 0.2 && !isMiniBossWave;

            state.game.hazard = null;
            if (!isMiniBossWave && !isThematic && state.game.wave > 3 && Math.random() < 0.25) {
                const hazards = ['Solar Flare', 'Ion Storm', 'Debris Field'];
                state.game.hazard = hazards[Math.floor(Math.random() * hazards.length)];
            }

            let theme = null;
            let themeTitle = `Wave ${state.game.wave} Started`;
            let themeSubtitle = 'Enemy signatures inbound';

            if (isThematic) {
                const themes = ['Asteroid Belt', 'Fighter Squadron', 'Juggernauts'];
                theme = themes[Math.floor(Math.random() * themes.length)];
                if (theme === 'Asteroid Belt') {
                    themeTitle = 'Asteroid Belt';
                    themeSubtitle = 'Massive rock cluster approaching';
                } else if (theme === 'Fighter Squadron') {
                    themeTitle = 'Fighter Squadron';
                    themeSubtitle = 'High-speed ships incoming';
                } else if (theme === 'Juggernauts') {
                    themeTitle = 'Juggernaut Fleet';
                    themeSubtitle = 'Heavy armor detected';
                }
            } else if (isMiniBossWave) {
                themeTitle = 'Mini-Boss Approaching';
                themeSubtitle = 'High-threat vessel detected';
            } else if (state.game.hazard === 'Solar Flare') {
                themeTitle = 'Solar Flare Active'; themeSubtitle = 'Satellite fire rates reduced';
            } else if (state.game.hazard === 'Ion Storm') {
                themeTitle = 'Ion Storm Active'; themeSubtitle = 'Shield healing blocked';
            } else if (state.game.hazard === 'Debris Field') {
                themeTitle = 'Debris Field'; themeSubtitle = 'Satellite sensor range reduced';
            }

            if (!isMiniBossWave && state.game.wave > 2 && Math.random() < 0.15) {
                const isComet = Math.random() < 0.5;
                state.spawnQueue.push({ delay: 60, waveNum: state.game.wave, profileIndex: isComet ? 8 : 9, theme: null });
                state.game.totalWaveEnemies++;
                showGameNotice(`<i class="fa-solid fa-satellite-dish text-purple-400"></i> Deep Space Anomaly Detected!`, 4000);
            }

            showWaveEvent(themeTitle, themeSubtitle, isThematic || state.game.hazard ? 'red' : (isMiniBossWave ? 'fuchsia' : 'amber'));
            playSynthSound(isMiniBossWave || isThematic || state.game.hazard ? 'warning' : 'wave_start');

            let baseBudget = 15 + Math.floor(state.game.wave * 12);
            const riskContract = getDirectiveEffectValue('riskContract');
            const warBudget = getDirectiveEffectValue('warBudget');
            if (riskContract) baseBudget = Math.ceil(baseBudget * (1 + riskContract.enemy));
            if (warBudget) baseBudget = Math.ceil(baseBudget * (1 + warBudget.enemy));

            let pool = [];
            if (theme === 'Asteroid Belt') {
                pool = [0, 1, 2, 3];
                baseBudget = Math.floor(baseBudget * 1.5);
            } else if (theme === 'Fighter Squadron') {
                pool = [4, 5];
            } else if (theme === 'Juggernauts') {
                pool = [2, 6];
            } else {
                pool = [0];
                if (state.game.wave >= 2) pool.push(1);
                if (state.game.wave >= 4) pool.push(2);
                if (state.game.wave >= 7) pool.push(3);
                if (state.game.wave >= 3) pool.push(4);
                if (state.game.wave >= 5) pool.push(5);
                if (state.game.wave >= 8) pool.push(6);
            }

            const eliteIncentive = getDirectiveEffectValue('eliteIncentive');
            if (eliteIncentive && state.game.wave >= 3 && !isThematic) {
                const extraEliteRolls = Math.max(1, Math.floor(eliteIncentive.spawn * 4));
                for (let i = 0; i < extraEliteRolls; i++) pool.push(7);
            }

            state.game.totalWaveEnemies = 0;
            state.game.enemiesSpawnedThisWave = 0;
            state.spawnQueue = [];
            let timeOffset = 0;

            while (baseBudget > 0) {
                let valid = pool.filter(i => ENEMY_PROFILES[i].threatCost <= baseBudget);
                if (valid.length === 0) valid = [pool[0]];
                let picked = valid[Math.floor(Math.random() * valid.length)];
                let cost = ENEMY_PROFILES[picked].threatCost || 1;

                let count = 1;
                let gap = Math.max(15, 60 - state.game.wave * 2);

                if ((picked === 0 || picked === 5) && baseBudget >= cost * 3 && Math.random() < 0.4) {
                    count = Math.floor(Math.random() * 3) + 3;
                    gap = 8;
                }

                for (let i = 0; i < count; i++) {
                    state.spawnQueue.push({ delay: timeOffset, waveNum: state.game.wave, profileIndex: picked, theme: theme });
                    timeOffset = gap;
                    baseBudget -= cost;
                    state.game.totalWaveEnemies++;
                    if (baseBudget <= 0) break;
                }
                timeOffset = Math.max(30, 90 - state.game.wave * 2);
            }

            if (isMiniBossWave && !isThematic) {
                const escortTypes = [
                    { index: 4, count: 5 }, // Scout Fighter
                    { index: 5, count: 3 }, // Void Swarmer
                    { index: 6, count: 2 }  // Armored Cruiser
                ];
                const escort = escortTypes[Math.floor(Math.random() * escortTypes.length)];

                state.spawnQueue.push({ delay: Math.max(60, 120 - state.game.wave * 2), waveNum: state.game.wave, profileIndex: 7, theme: null, isEscort: false });
                state.game.totalWaveEnemies++;

                for (let i = 0; i < escort.count; i++) {
                    state.spawnQueue.push({ delay: 15, waveNum: state.game.wave, profileIndex: escort.index, theme: null, isEscort: true, escortIndex: i, escortTotal: escort.count });
                    state.game.totalWaveEnemies++;
                }
            }

            const wThreat = document.getElementById('enemies-wave-threat'); if (wThreat) wThreat.innerText = `ROUND TOTAL: ${state.game.totalWaveEnemies}`;
            const remThreat = document.getElementById('enemies-remaining'); if (remThreat) remThreat.innerText = `REMAINING: ${state.game.totalWaveEnemies}`;
            const mRemThreat = document.getElementById('mobile-rem'); if (mRemThreat) mRemThreat.innerText = state.game.totalWaveEnemies;

            if (isMiniBossWave && !isThematic) {
                const warn = document.getElementById('warning-banner');
                const warnContent = document.getElementById('warning-banner-content');
                if (warn && warnContent) { warnContent.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1 animate-ping"></i> MINI-BOSS DETECTED - WAVE ${state.game.wave}`; warn.classList.remove('hidden'); setTimeout(() => warn.classList.add('hidden'), 5000); }
            } else if (isThematic) {
                const warn = document.getElementById('warning-banner');
                const warnContent = document.getElementById('warning-banner-content');
                if (warn && warnContent) { warnContent.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1 animate-ping"></i> ${themeTitle.toUpperCase()}`; warn.classList.remove('hidden'); setTimeout(() => warn.classList.add('hidden'), 5000); }
            }
        }

        function endWave() {
            const completedWave = state.game.wave;
            state.waveActive = false; state.game.wave++;
            suppressStarterTooltips(false);
            const wDisp = document.getElementById('wave-display'); if (wDisp) wDisp.innerText = state.game.wave;
            const mWDisp = document.getElementById('mobile-wave'); if (mWDisp) mWDisp.innerText = state.game.wave;
            setWaveLaunchReady(true);
            setBuildControlEnabled(true);
            if (state.game.selectedTower) selectTower(state.game.selectedTower);
            updateOrbitInspectorUI();
            let waveReward = 120 + (state.game.wave * 20) + getDirectiveEffectValue('waveGold', 0);
            const interest = getDirectiveEffectValue('interest');
            if (interest) waveReward += Math.min(interest.cap, Math.floor(state.game.gold * interest.rate));
            const debt = getDirectiveEffectValue('debtFinancing');
            if (debt) state.game.gold = Math.max(0, Math.floor(state.game.gold * (1 - debt.loss)));
            const waveRepair = getDirectiveEffectValue('waveRepair', 0);
            if (waveRepair) {
                for (const tower of state.game.towers) tower.hp = Math.min(tower.maxHp, tower.hp + tower.maxHp * waveRepair);
            }
            addGold(waveReward);
            showWaveEvent(`Wave ${completedWave} Cleared`, `Recovered ${waveReward} credits. Next wave ready.`, 'emerald');
            playSynthSound('wave_clear');
            if (isBossWave(state.game.wave)) {
                showGameNotice('<i class="fa-solid fa-skull mr-1"></i> Detected: Boss Ship Incoming! Prepare for battle!', 5200);
            }
        }

        function triggerCleanGameReset() {
            state.game.running = true; state.game.paused = false; state.game.score = 0; state.game.wave = 1; state.game.totalWaveEnemies = 10; state.game.enemiesSpawnedThisWave = 0;
            state.game.earthHealth = state.game.earthMaxHealth; state.game.earthShield = state.game.earthMaxShield; state.game.towers = []; state.game.enemies = []; state.game.projectiles = []; state.game.particles = [];
            state.game.tactical = { laser: { cd: 0, maxCd: 1800, active: false, unlocked: false }, emp: { cd: 0, maxCd: 2400, unlocked: false }, overcharge: { cd: 0, maxCd: 3600, activeTime: 0, unlocked: false } };
            state.game.selectedTower = null; state.game.selectedShopType = null; state.game.orbitGridHighlights = false;
            state.game.mode = 'defense'; state.game.commandDirectives = {}; state.game.directiveKills = 0;
            state.game.isTimeAttack = false;
            state.game.bossIndex = 0;
            state.game.bossRepairKits = 0;
            state.game.fastForward = false; state.game.cameraShake = 0; state.game.damageOverlayAlpha = 0; state.game.shieldOverlayAlpha = 0;
            updateFastForwardUI();
            state.firstDeploymentSlotHintShown = false;
            state.masterCommandTourSeen = false;
            state.masterCommandTourStep = 0;

            state.orbitLockStates = [false, true, true]; state.orbitSlotCapacities = [4, 4, 4]; state.orbitUpgradesCount = [0, 0, 0]; state.orbitRotations = [0, 0, 0];
            state.shieldUpgradeLevel = 0; state.game.earthMaxShield = 100 + state.research.baseShield * 25; state.game.earthShield = state.game.earthMaxShield;
            addRandomOrbitSlots(state.research.startSlots);

            state.waveActive = false; state.spawnQueue = []; state.spawnTimer = 0; state.lightningArcsToDraw = []; state.shipAttackBeamsToDraw = [];
            resetBossMode();
            updateBossCardList();

            ['wave-display', 'mobile-wave'].forEach(id => { const el = document.getElementById(id); if (el) el.innerText = state.game.wave; });
            const scoreDisplay = document.getElementById('score-display'); if (scoreDisplay) scoreDisplay.innerText = state.game.score;
            const enemiesWaveThreat = document.getElementById('enemies-wave-threat'); if (enemiesWaveThreat) enemiesWaveThreat.innerText = `ROUND TOTAL: 10`;
            const enemiesRemaining = document.getElementById('enemies-remaining'); if (enemiesRemaining) enemiesRemaining.innerText = `REMAINING: 10`;
            const mobileRem = document.getElementById('mobile-rem'); if (mobileRem) mobileRem.innerText = 10;
            const mobileActive = document.getElementById('mobile-active'); if (mobileActive) mobileActive.innerText = 0;

            ['health-text', 'mobile-health-text'].forEach(id => { const el = document.getElementById(id); if (el) el.innerText = `${state.game.earthHealth}/${state.game.earthMaxHealth}`; });
            ['health-bar', 'mobile-health-bar'].forEach(id => { const el = document.getElementById(id); if (el) el.style.width = '100%'; });
            ['shield-text', 'mobile-shield-text'].forEach(id => { const el = document.getElementById(id); if (el) el.innerText = `${state.game.earthShield}/${state.game.earthMaxShield}`; });
            ['shield-bar', 'mobile-shield-bar'].forEach(id => { const el = document.getElementById(id); if (el) el.style.width = '100%'; });

            setWaveLaunchReady(true);
            setBuildControlEnabled(true);

            closeInspector(); closeOrbitInspector(); closeBlueprintDrawer();
            state.starterTooltipsSuppressed = false;
            state.tutorialHints.planet = false;
            state.tutorialHints.build = true;
            updateTutorialTooltips();

            setGold(state.isDevMode ? 100000 : 500);

            const gameoverModal = document.getElementById('gameover-modal');
            if (gameoverModal) gameoverModal.classList.add('hidden');
            switchBgm('default');
        }

        // ----------------------------------------------------------------------
        // 9. POINTER CONTROL DISPATCHER
        // ----------------------------------------------------------------------
        function updateBossDragPosition(e) {
            const coords = getPointerCoords(e);
            state.bossMode.player.targetX = coords.x - (state.bossMode.player.dragOffsetX || 0);
            state.bossMode.player.targetY = coords.y - (state.bossMode.player.dragOffsetY || 0);
        }

        function updateTacticalUI() {
            const panel = document.getElementById('tactical-panel');
            if (!panel) return;

            const anyUnlocked = state.game.tactical && (state.game.tactical.laser.unlocked || state.game.tactical.emp.unlocked || state.game.tactical.overcharge.unlocked);
            if (!state.game.running || state.game.mode !== 'defense' || !anyUnlocked) {
                panel.classList.add('hidden'); return;
            }

            panel.classList.remove('hidden');
            ['laser', 'emp', 'overcharge'].forEach(tac => {
                const btn = document.getElementById(`btn-tac-${tac}`);
                const bar = document.getElementById(`cd-tac-${tac}`);
                if (bar && btn && state.game.tactical && state.game.tactical[tac]) {
                    if (state.game.tactical[tac].unlocked) {
                        btn.classList.remove('hidden');
                        const cd = state.game.tactical[tac].cd; const max = state.game.tactical[tac].maxCd;
                        bar.style.width = `${Math.max(0, (1 - cd / max)) * 100}%`;
                        btn.classList.toggle('opacity-40', cd > 0); btn.classList.toggle('cursor-not-allowed', cd > 0);
                        if (tac === 'laser') { btn.classList.toggle('ring-2', state.game.tactical.laser.active); btn.classList.toggle('ring-red-400', state.game.tactical.laser.active); }
                    } else {
                        btn.classList.add('hidden');
                    }
                }
            });
        }

        function handlePointerDown(e) {
            if (!state.game || !state.game.running) return;
            if (state.game.mode === 'boss') return;
            const now = Date.now();
            if (now - state.lastInputTime < 100) return;
            state.lastInputTime = now;

            const coords = getPointerCoords(e);

            if (state.game.mode === 'defense' && state.game.tactical && state.game.tactical.laser.active) {
                state.game.tactical.laser.active = false;
                state.game.tactical.laser.cd = state.game.tactical.laser.maxCd;
                createExplosion(coords.x, coords.y, '#f43f5e', 40);
                playSynthSound('explosion');
                state.game.cameraShake = Math.min(30, (state.game.cameraShake || 0) + 15 * state.screenShakeIntensity);
                state.game.enemies.forEach((e, i) => {
                    if (Math.hypot(e.x - coords.x, e.y - coords.y) < 150 * state.gameScale) {
                        e.hp -= 450 * (1 + state.research.baseDamage * 0.05);
                    }
                });
                state.shipAttackBeamsToDraw.push({ x1: canvas.width / 2, y1: canvas.height / 2, x2: coords.x, y2: coords.y, color: '#f43f5e', alpha: 1, width: 8 });
                return;
            }

            const centerX = canvas.width / 2; const centerY = canvas.height / 2;
            if (!state.game.selectedShopType && Math.hypot(coords.x - centerX, coords.y - centerY) < getPlanetTapRadius()) {
                if (state.game.towers.length === 0) {
                    showGameNotice('<i class="fa-solid fa-hammer mr-1"></i> Deploy a satellite first before opening Master Command.', 3000);
                    const hint = document.getElementById('action-hint');
                    if (hint) hint.innerHTML = `<span class="text-emerald-300 font-bold">Build a satellite first. Master Command unlocks after deployment.</span>`;
                    state.tutorialHints.build = true;
                    updateTutorialTooltips();
                    return;
                }
                state.planetTutorialTooltipShown = true;
                state.tutorialHints.planet = false;
                updateTutorialTooltips();
                toggleOrbitInspector(); return;
            }

            calculateHoveredOrbitAndAngle(coords.x, coords.y);
            if (state.game.selectedShopType) {
                if (!hasEmptyDeployableOrbitSlot()) {
                    notifyNoEmptyOrbitSlots();
                    cancelBuildMode({ keepHint: true });
                    return;
                }
                const { closest, dist } = getClosestSlot(coords.x, coords.y);
                if (!closest || dist > getSlotTapRadius()) {
                    const hint = document.getElementById('action-hint');
                    if (hint) hint.innerHTML = `<span class="text-emerald-400 font-bold">Tap directly on a glowing empty slot to deploy.</span>`;
                    return;
                }

                if (state.orbitLockStates[closest.orbitIndex]) {
                    const hint = document.getElementById('action-hint');
                    if (hint) hint.innerHTML = `<span class="text-red-400 font-bold">That orbit is locked. Open Master Command to unlock it.</span>`;
                    return;
                }

                const orbitIndex = closest.orbitIndex;
                const slotIndex = closest.slotIndex;
                const cost = getSatelliteBuildCost(state.game.selectedShopType);
                if (state.game.gold >= cost) {
                    if (!state.game.towers.some(t => t.orbitIndex === orbitIndex && t.slotIndex === slotIndex)) {
                        const deployedType = state.game.selectedShopType;
                        spendGold(cost);
                        const newSat = new Satellite(deployedType, orbitIndex, slotIndex);
                        newSat.investedGold = cost;
                        state.game.towers.push(newSat); state.game.towersBuiltCount++;
                        state.firstDeploymentSlotHintShown = true;
                        playSynthSound('upgrade'); createExplosion(newSat.x, newSat.y, SATELLITE_CONFIGS[deployedType].color, 12);

                        const hint = document.getElementById('action-hint');
                        if (isMobileBuildView()) {
                            state.game.selectedShopType = null;
                            state.game.orbitGridHighlights = false;
                            suppressStarterTooltips(false);
                            if (hint) hint.innerText = "Select another satellite blueprint to continue building.";
                            openBlueprintDrawer(false);
                            updateBuildButtonState();
                        } else if (state.game.gold >= getSatelliteBuildCost(deployedType) && hasEmptyDeployableOrbitSlot()) {
                            state.game.selectedShopType = deployedType;
                            state.game.orbitGridHighlights = true;
                            if (hint) hint.innerHTML = `Deployment Mode: <span class="text-emerald-400 font-bold">Continue placing ${SATELLITE_CONFIGS[deployedType].name}, or select another blueprint.</span>`;
                            updateBuildButtonState();
                            updateBlueprintOverlay();
                        } else if (!hasEmptyDeployableOrbitSlot()) {
                            state.game.selectedShopType = null;
                            state.game.orbitGridHighlights = false;
                            suppressStarterTooltips(false);
                            notifyNoEmptyOrbitSlots();
                            updateBuildButtonState();
                        } else {
                            state.game.selectedShopType = null;
                            state.game.orbitGridHighlights = false;
                            suppressStarterTooltips(false);
                            if (hint) hint.innerHTML = `<span class="text-red-400 font-bold">Insufficient credits to continue building ${SATELLITE_CONFIGS[deployedType].name}.</span>`;
                            updateBuildButtonState();
                        }
                        if (!hasEmptyDeployableOrbitSlot()) showOrbitExpansionPrompt();
                        updateShopAvailability();
                    } else {
                        const hint = document.getElementById('action-hint');
                        if (hint) hint.innerHTML = "<span class='text-red-400 font-bold'>This slot is already occupied!</span>";
                    }
                } else {
                    const hint = document.getElementById('action-hint');
                    if (hint) hint.innerHTML = `<span class="text-red-400 font-bold">Need ${cost} Gold!</span>`;
                    if (isMobileBuildView()) {
                        state.game.selectedShopType = null;
                        state.game.orbitGridHighlights = false;
                        suppressStarterTooltips(false);
                        openBlueprintDrawer(false);
                        updateShopAvailability();
                        updateBuildButtonState();
                    } else {
                        state.game.selectedShopType = null;
                        state.game.orbitGridHighlights = false;
                        suppressStarterTooltips(false);
                        updateShopAvailability();
                        updateBuildButtonState();
                    }
                }
                return;
            }

            const clickedTower = checkTowerSelection(coords.x, coords.y);
            if (clickedTower) { playSynthSound('select_tower'); selectTower(clickedTower); return; }

            closeInspector(); closeOrbitInspector(); closeBlueprintDrawer();
        }

        // ----------------------------------------------------------------------
        // 10. ACTION BINDINGS MATRIX
        // ----------------------------------------------------------------------
        function hideTitleSubpanels() {
            ['inline-settings-options', 'inline-encyclopedia-options', 'inline-install-options', 'inline-patch-notes-options', 'inline-boss-attack-options', 'inline-research-options'].forEach(id => {
                const panel = document.getElementById(id);
                if (panel) panel.classList.add('hidden');
            });
        }

        function populateBossAttackPanel() {
            const container = document.getElementById('boss-attack-list');
            if (!container) return;
            container.innerHTML = BOSS_SHIPS.map((boss, index) => `
                <button id="boss-attack-btn-${index}" class="bg-slate-900 hover:bg-slate-800 border border-fuchsia-500/30 p-2 rounded-lg flex items-center justify-between transition-all active:scale-95 select-none pointer-events-auto">
                    <span class="text-fuchsia-300 text-[10px] uppercase tracking-widest font-black">${boss.name}</span>
                    <i class="fa-solid fa-play text-slate-500 text-[10px]"></i>
                </button>
            `).join('');

            BOSS_SHIPS.forEach((boss, index) => {
                bindButton(`boss-attack-btn-${index}`, () => {
                    initAudio();
                    const introModal = document.getElementById('intro-modal');
                    if (introModal) introModal.classList.add('hidden');
                    triggerCleanGameReset();
                    state.game.isTimeAttack = true;
                    state.game.timeAttackBossIndex = index;
                    state.game.wave = BOSS_FIRST_WAVE + index * BOSS_ROUND_INTERVAL;
                    startBossMode();
                });
            });
        }

        function renderPatchNotes() {
            const container = document.getElementById('patch-notes-list');
            if (!container) return;
            container.innerHTML = PATCH_NOTES.map(entry => `
                <article class="bg-slate-900 border border-lime-400/20 rounded-xl p-3">
                    <div class="text-lime-300 text-xs font-black uppercase tracking-widest">Version ${entry.version}</div>
                    <ul class="mt-2 space-y-1.5 text-[10px] text-slate-300 leading-snug font-bold">
                        ${entry.notes.map(note => `<li>${note}</li>`).join('')}
                    </ul>
                </article>
            `).join('');
        }

        let confirmModalCallback = null;
        function showConfirmModal(title, desc, onConfirm) {
            const modal = document.getElementById('confirm-modal');
            const titleEl = document.getElementById('confirm-modal-title');
            const descEl = document.getElementById('confirm-modal-desc');
            if (titleEl) titleEl.innerText = title;
            if (descEl) descEl.innerText = desc;
            confirmModalCallback = onConfirm;
            if (modal) modal.classList.remove('hidden');
            playSynthSound('hit');
        }

        bindButton('start-game-btn', () => { initAudio(); const introModal = document.getElementById('intro-modal'); if (introModal) introModal.classList.add('hidden'); triggerCleanGameReset(); });

        bindButton('open-settings-options-btn', () => {
            hideTitleSubpanels();
            const settings = document.getElementById('inline-settings-options');
            if (settings) {
                loadSettings();
                settings.classList.remove('hidden');
            }
            playSynthSound('upgrade');
        });
        bindButton('open-encyclopedia-options-btn', () => {
            hideTitleSubpanels();
            populateSpaceEncyclopedia();
            const encyclopedia = document.getElementById('inline-encyclopedia-options');
            if (encyclopedia) encyclopedia.classList.remove('hidden');
            playSynthSound('upgrade');
        });
        bindButton('open-patch-notes-btn', () => {
            hideTitleSubpanels();
            renderPatchNotes();
            const patchNotes = document.getElementById('inline-patch-notes-options');
            if (patchNotes) patchNotes.classList.remove('hidden');
            playSynthSound('upgrade');
        });
        bindButton('open-install-options-btn', () => {
            hideTitleSubpanels();
            syncInstallUI();
            const installPanel = document.getElementById('inline-install-options');
            if (installPanel) installPanel.classList.remove('hidden');
            playSynthSound('upgrade');
        });
        bindButton('open-boss-attack-btn', () => {
            hideTitleSubpanels();
            populateBossAttackPanel();
            const panel = document.getElementById('inline-boss-attack-options');
            if (panel) panel.classList.remove('hidden');
            playSynthSound('upgrade');
        });
        bindButton('open-research-btn', () => {
            hideTitleSubpanels();
            updateResearchUI();
            const panel = document.getElementById('inline-research-options');
            if (panel) panel.classList.remove('hidden');
            playSynthSound('upgrade');
        });

        function closeSettingsPanel() {
            const settings = document.getElementById('inline-settings-options');
            if (settings) settings.classList.add('hidden');
            loadSettings();
            playSynthSound('upgrade');
        }
        bindButton('close-settings-options-btn', closeSettingsPanel);
        bindButton('back-settings-options-btn', closeSettingsPanel);

        function closePauseSettingsPanel() {
            const settings = document.getElementById('pause-settings-modal');
            if (settings) settings.classList.add('hidden');
            loadSettings();
            playSynthSound('upgrade');
        }
        bindButton('close-pause-settings-btn', closePauseSettingsPanel);
        bindButton('back-pause-settings-btn', closePauseSettingsPanel);

        bindButton('pause-settings-save-btn', () => {
            showConfirmModal("SAVE SETTINGS", "Apply changes to system configuration?", () => {
                applyPauseSettingsFromUI();
                const settingsPanel = document.getElementById('pause-settings-modal');
                if (settingsPanel) settingsPanel.classList.add('hidden');
            });
        });

        bindButton('close-encyclopedia-options-btn', () => { const encyclopedia = document.getElementById('inline-encyclopedia-options'); if (encyclopedia) encyclopedia.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('back-encyclopedia-options-btn', () => { const encyclopedia = document.getElementById('inline-encyclopedia-options'); if (encyclopedia) encyclopedia.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('close-patch-notes-btn', () => { const patchNotes = document.getElementById('inline-patch-notes-options'); if (patchNotes) patchNotes.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('back-patch-notes-btn', () => { const patchNotes = document.getElementById('inline-patch-notes-options'); if (patchNotes) patchNotes.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('encyclopedia-menu-satellites', () => { scrollEncyclopediaTo('satellites'); });
        bindButton('encyclopedia-menu-rocks', () => { scrollEncyclopediaTo('rocks'); });
        bindButton('encyclopedia-menu-ships', () => { scrollEncyclopediaTo('ships'); });
        bindButton('encyclopedia-menu-directives', () => { scrollEncyclopediaTo('directives'); });
        bindButton('close-install-options-btn', () => { const installPanel = document.getElementById('inline-install-options'); if (installPanel) installPanel.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('back-install-options-btn', () => { const installPanel = document.getElementById('inline-install-options'); if (installPanel) installPanel.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('close-boss-attack-btn', () => { const panel = document.getElementById('inline-boss-attack-options'); if (panel) panel.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('back-boss-attack-btn', () => { const panel = document.getElementById('inline-boss-attack-options'); if (panel) panel.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('close-research-btn', () => { const panel = document.getElementById('inline-research-options'); if (panel) panel.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('back-research-btn', () => { const panel = document.getElementById('inline-research-options'); if (panel) panel.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('android-install-btn', triggerAndroidInstall);
        bindButton('check-update-btn', triggerCheckUpdate);

        bindButton('open-build-drawer-btn', () => {
            if (state.waveActive || state.game.mode === 'boss') {
                showGameNotice('<i class="fa-solid fa-triangle-exclamation mr-1"></i> Building is disabled while under attack. Only repairs are allowed.', 3000);
                return;
            }
            state.tutorialHints.build = false;
            updateTutorialTooltips();
            if (state.game.selectedShopType) {
                cancelBuildMode();
                return;
            }
            toggleBlueprintDrawer();
        });

        bindButton('settings-save-btn', () => {
            showConfirmModal("SAVE SETTINGS", "Apply changes to system configuration?", () => {
                applySettingsFromUI();
                const settingsPanel = document.getElementById('inline-settings-options');
                if (settingsPanel) settingsPanel.classList.add('hidden');
            });
        });

        bindButton('confirm-yes-btn', () => {
            const modal = document.getElementById('confirm-modal');
            if (modal) modal.classList.add('hidden');
            if (confirmModalCallback) confirmModalCallback();
            playSynthSound('upgrade');
        });
        bindButton('confirm-no-btn', () => {
            const modal = document.getElementById('confirm-modal');
            if (modal) modal.classList.add('hidden');
            playSynthSound('hit');
        });

        bindButton('pause-encyclopedia-btn', () => {
            populateSpaceEncyclopedia();
            const encyclopedia = document.getElementById('inline-encyclopedia-options');
            if (encyclopedia) encyclopedia.classList.remove('hidden');
            playSynthSound('upgrade');
        });

        bindButton('pause-settings-btn', () => {
            const settings = document.getElementById('pause-settings-modal');
            if (settings) {
                loadSettings();
                settings.classList.remove('hidden');
            }
            playSynthSound('upgrade');
        });
        bindButton('resume-game-btn', () => { state.game.paused = false; syncBgm(); const pm = document.getElementById('pause-modal'); if (pm) pm.classList.add('hidden'); playSynthSound('upgrade'); });
        bindButton('pause-restart-game-btn', () => { const pm = document.getElementById('pause-modal'); if (pm) pm.classList.add('hidden'); triggerCleanGameReset(); playSynthSound('upgrade'); });
        bindButton('pause-encyclopedia-btn', () => { const pm = document.getElementById('pause-modal'); if (pm) pm.classList.add('hidden'); toggleEncyclopedia(); playSynthSound('upgrade'); });
        bindButton('quit-to-menu-btn', () => { state.game.running = false; state.game.paused = false; state.game.mode = 'defense'; resetBossMode(); setBuildControlEnabled(true); switchBgm('default'); const pm = document.getElementById('pause-modal'); if (pm) pm.classList.add('hidden'); const im = document.getElementById('intro-modal'); if (im) im.classList.remove('hidden'); playSynthSound('earth_hit'); checkPendingUpdates(); });
        bindButton('restart-game-btn', triggerCleanGameReset);
        bindButton('gameover-quit-btn', () => { state.game.running = false; state.game.paused = false; state.game.mode = 'defense'; resetBossMode(); setBuildControlEnabled(true); switchBgm('default'); const gm = document.getElementById('gameover-modal'); if (gm) gm.classList.add('hidden'); const im = document.getElementById('intro-modal'); if (im) im.classList.remove('hidden'); playSynthSound('earth_hit'); checkPendingUpdates(); });
        bindButton('mobile-launch-btn', startNextWave);
        bindButton('settings-toggle-btn', triggerPauseToggle);
        bindButton('mobile-settings-toggle-btn', triggerPauseToggle);
        bindButton('boss-failed-return-btn', returnToBaseAfterBossFailure);

        bindButton('fast-forward-btn', () => {
            state.game.fastForward = !state.game.fastForward;
            updateFastForwardUI();
            playSynthSound('upgrade');
        });
        bindButton('mobile-fast-forward-btn', () => {
            state.game.fastForward = !state.game.fastForward;
            updateFastForwardUI();
            playSynthSound('upgrade');
        });

        bindButton('btn-tac-laser', () => {
            if (state.game.tactical && state.game.tactical.laser.cd <= 0) {
                state.game.tactical.laser.active = !state.game.tactical.laser.active;
                if (state.game.tactical.laser.active) {
                    showGameNotice("<i class='fa-solid fa-crosshairs'></i> Select target for Orbital Strike!", 3000);
                }
            }
        });
        bindButton('btn-tac-emp', () => {
            if (state.game.tactical && state.game.tactical.emp.cd <= 0) {
                state.game.tactical.emp.cd = state.game.tactical.emp.maxCd;
                state.game.enemies.forEach(e => {
                    e.slowMultiplier = 0.1;
                    e.slowTimer = 180;
                });
                createExplosion(canvas.width / 2, canvas.height / 2, '#38bdf8', 50);
                state.game.cameraShake = Math.min(20, (state.game.cameraShake || 0) + 10 * state.screenShakeIntensity);
                playSynthSound('shield_deflect');
                showGameNotice("<i class='fa-solid fa-bolt text-cyan-400'></i> EMP Pulse Deployed!", 2000);
            }
        });
        bindButton('btn-tac-overcharge', () => {
            if (state.game.tactical && state.game.tactical.overcharge.cd <= 0) {
                state.game.tactical.overcharge.cd = state.game.tactical.overcharge.maxCd;
                state.game.tactical.overcharge.activeTime = 300;
                state.game.earthShield = Math.min(state.game.earthMaxShield * 1.5, state.game.earthShield + state.game.earthMaxShield * 0.5);
                createExplosion(canvas.width / 2, canvas.height / 2, '#34d399', 50);
                syncPlanetBars(); playSynthSound('upgrade');
                showGameNotice("<i class='fa-solid fa-shield-cat text-emerald-400'></i> Shield Overcharge & Weapons Hot!", 2000);
            }
        });

        bindButton('btn-boss-repair', () => {
            if (state.bossMode.player.repairKits > 0 && state.bossMode.player.hp < state.bossMode.player.maxHp) {
                state.bossMode.player.repairKits--;
                state.bossMode.player.hp = Math.min(state.bossMode.player.maxHp, state.bossMode.player.hp + state.bossMode.player.maxHp * 0.25);
                updateRepairButton();
                createExplosion(state.bossMode.player.x, state.bossMode.player.y, '#10b981', 20);
                playSynthSound('upgrade');
            }
        });

        bindButton('btn-boss-weapon-remove', () => {
            if (state.bossMode.player.weapon !== 'default') {
                state.bossMode.player.weapon = 'default';
                updateRepairButton();
                showGameNotice(`<i class="fa-solid fa-eject text-slate-400"></i> Weapon Add-on Ejected`, 2000);
                playSynthSound('hit');
            }
        });

        function triggerBossShield() {
            const player = state.bossMode.player;
            if (!player.shieldUsed) {
                player.shieldUsed = true;
                player.shieldTimer = 180;
                player.invulnTimer = Math.max(player.invulnTimer || 0, 180);
                playSynthSound('shield_deflect');
                showGameNotice(`<i class="fa-solid fa-shield-halved text-cyan-400"></i> Proton Shield Activated!`, 2000);
            }
        }

        bindButton('btn-boss-shield', () => triggerBossShield());

        ['laser', 'plasma', 'missile', 'railgun', 'lasersentry', 'lightningsentry', 'magnetsentry'].forEach(type => {
            bindButton('shop-' + type, () => {
                const ah = document.getElementById('action-hint');
                if (state.game.selectedShopType === type) {
                    cancelBuildMode();
                } else {
                    if (!hasEmptyDeployableOrbitSlot()) {
                        notifyNoEmptyOrbitSlots();
                        cancelBuildMode({ keepHint: true });
                        return;
                    }
                    state.game.selectedShopType = type;
                    state.game.orbitGridHighlights = true;
                    suppressStarterTooltips(true);
                    if (ah) ah.innerHTML = `Deployment Mode: <span class="text-emerald-400 font-bold">Tap near any glowing empty slot to place ${SATELLITE_CONFIGS[type].name}</span>`;
                    state.game.mousePos = getFirstEmptyDeployableSlot() || state.game.mousePos;
                    if (isMobileBuildView()) closeBlueprintDrawer();
                }
                updateShopAvailability();
                updateBuildButtonState();
            });
        });

        bindButton('btn-upgrade-sat', () => {
            if (state.waveActive || state.game.mode === 'boss') {
                showGameNotice('<i class="fa-solid fa-triangle-exclamation mr-1"></i> Upgrades are disabled while under attack.', 3000);
                return;
            }
            const t = state.game.selectedTower;
            if (!t || (t.level || 1) >= 10) return;
            const cost = getSatelliteUpgradeCost(t);
            if (state.game.gold >= cost) {
                spendGold(cost);
                t.investedGold += cost;
                t.level = (t.level || 1) + 1;
                playSynthSound('upgrade');
                selectTower(t);
                createExplosion(t.x, t.y, '#f59e0b', 14);
            }
        });
        bindButton('btn-repair-sat', () => { const t = state.game.selectedTower; if (!t) return; const cost = getSatelliteRepairCost(t); if (cost > 0 && state.game.gold >= cost) { spendGold(cost); t.investedGold += cost; t.hp = t.maxHp; playSynthSound('upgrade'); createExplosion(t.x, t.y, '#f59e0b', 12); selectTower(t); } });
        bindButton('btn-destroy-sat', () => {
            if (state.waveActive || state.game.mode === 'boss') {
                showGameNotice('<i class="fa-solid fa-triangle-exclamation mr-1"></i> Salvaging is disabled while under attack.', 3000);
                return;
            }
            if (!state.game.selectedTower) return;
            const t = state.game.selectedTower; const refund = getSatelliteSalvageValue(t); addGold(refund); createExplosion(t.x, t.y, '#f59e0b', 15); playSynthSound('upgrade'); state.game.towers = state.game.towers.filter(item => item.id !== t.id); closeInspector(); updateBlueprintOverlay();
        });

        bindButton('btn-prev-sat', () => cycleSelectedSatellite(-1));
        bindButton('btn-next-sat', () => cycleSelectedSatellite(1));

        for (let i = 0; i < 3; i++) {
            bindButton(`orbit-btn-${i}`, () => { handleOrbitButtonPress(i); });
        }
        bindButton('accordion-orbits-btn', () => { setMasterAccordion('orbits'); });
        bindButton('accordion-directives-btn', () => { setMasterAccordion('directives'); });
        bindButton('accordion-tactical-btn', () => { setMasterAccordion('tactical'); });

        ['laser', 'emp', 'overcharge'].forEach(tac => {
            bindButton(`cmd-unlock-tactical-${tac}`, () => {
                if (state.waveActive || state.game.mode === 'boss' || (state.game.tactical && state.game.tactical[tac].unlocked)) return;
                const costs = { laser: 300, emp: 400, overcharge: 500 };
                const cost = costs[tac];
                if (state.game.gold >= cost) {
                    spendGold(cost);
                    state.game.tactical[tac].unlocked = true;
                    playSynthSound('upgrade');
                    createExplosion(canvas.width / 2, canvas.height / 2, tac === 'laser' ? '#ef4444' : (tac === 'emp' ? '#06b6d4' : '#10b981'), 20);
                    const hint = document.getElementById('action-hint');
                    if (hint) hint.innerHTML = `<span class="text-emerald-400 font-bold">Tactical System Online!</span>`;
                    updateOrbitInspectorUI();
                    updateTacticalUI();
                } else {
                    playSynthSound('hit');
                }
            });
        });

        bindButton('master-command-tour-skip', finishMasterCommandTour);
        bindButton('master-command-tour-next', () => {
            state.masterCommandTourStep++;
            if (state.masterCommandTourStep >= MASTER_COMMAND_TOUR_STEPS.length) finishMasterCommandTour();
            else renderMasterCommandTour();
        });

        bindButton('cmd-repair-shield', () => { if (state.game.hazard === 'Ion Storm') { const ah = document.getElementById('action-hint'); if (ah) ah.innerHTML = `<span class="text-red-400 font-bold">Ion Storm active! Shield healing is blocked.</span>`; return; } const cost = 150; if (state.game.gold >= cost && state.game.earthShield < state.game.earthMaxShield) { spendGold(cost); state.game.earthShield = Math.min(state.game.earthMaxShield, state.game.earthShield + 40); const st = document.getElementById('shield-text'); const mst = document.getElementById('mobile-shield-text'); if (st) st.innerText = `${state.game.earthShield} / ${state.game.earthMaxShield}`; if (mst) mst.innerText = `${state.game.earthShield}/${state.game.earthMaxShield}`; const shieldWPercent = `${(state.game.earthShield / state.game.earthMaxShield) * 100}%`; const sb = document.getElementById('shield-bar'); const msb = document.getElementById('mobile-shield-bar'); if (sb) sb.style.width = shieldWPercent; if (msb) msb.style.width = shieldWPercent; playSynthSound('upgrade'); createExplosion(canvas.width / 2, canvas.height / 2, '#22d3ee', 15); const ah = document.getElementById('action-hint'); if (ah) ah.innerHTML = `<span class="text-emerald-400 font-bold">Shield integrity recharged!</span>`; } else { const ah = document.getElementById('action-hint'); if (ah) ah.innerHTML = state.game.earthShield >= state.game.earthMaxShield ? `<span class="text-red-400 font-bold">Shield is fully charged!</span>` : `<span class="text-red-400 font-bold">Need ${cost} Gold!</span>`; } });
        bindButton('cmd-upgrade-shield', () => {
            if (state.waveActive || state.game.mode === 'boss') {
                showGameNotice('<i class="fa-solid fa-triangle-exclamation mr-1"></i> Upgrades are disabled while under attack.', 3000);
                return;
            }
            if (state.shieldUpgradeLevel >= 6) return; const cost = 200 + state.shieldUpgradeLevel * 150; if (state.game.gold >= cost) { spendGold(cost); state.shieldUpgradeLevel++; state.game.earthMaxShield += 25; state.game.earthShield += 25; const st = document.getElementById('shield-text'); const mst = document.getElementById('mobile-shield-text'); if (st) st.innerText = `${state.game.earthShield} / ${state.game.earthMaxShield}`; if (mst) mst.innerText = `${state.game.earthShield}/${state.game.earthMaxShield}`; const shieldWPercent = `${(state.game.earthShield / state.game.earthMaxShield) * 100}%`; const sb = document.getElementById('shield-bar'); const msb = document.getElementById('mobile-shield-bar'); if (sb) sb.style.width = shieldWPercent; if (msb) msb.style.width = shieldWPercent; playSynthSound('upgrade'); createExplosion(canvas.width / 2, canvas.height / 2, '#06b6d4', 20); updateOrbitInspectorUI(); const ah = document.getElementById('action-hint'); if (ah) ah.innerHTML = `<span class="text-emerald-400 font-bold">Maximum Shield Capacity expanded!</span>`; } else { const ah = document.getElementById('action-hint'); if (ah) ah.innerHTML = `<span class="text-red-400 font-bold">Need ${cost} Gold!</span>`; }
        });

        document.querySelectorAll('.theme-preset-btn').forEach(btn => {
            if (!btn.id) btn.id = 'theme-btn-' + btn.dataset.theme;
            bindButton(btn.id, () => {
                state.activeThemeKey = btn.dataset.theme;
                refreshAtmosphereSelection();
                playSynthSound('upgrade');
            });
        });

        canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (state.game.mode === 'boss' && state.bossMode.active && state.bossMode.phase !== 'reward' && state.bossMode.phase !== 'failed') {
                const coords = getPointerCoords(e);
                const now = Date.now();
                if (now - (state.bossMode.player.lastTapTime || 0) < 300) {
                    triggerBossShield();
                }
                state.bossMode.player.lastTapTime = now;

                state.bossMode.player.dragging = true;
                state.bossMode.player.dragOffsetX = coords.x - state.bossMode.player.x;
                state.bossMode.player.dragOffsetY = coords.y - state.bossMode.player.y;
                if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
                return;
            }
            handlePointerDown(e);
        });
        canvas.addEventListener('pointermove', (e) => {
            const coords = getPointerCoords(e);
            state.game.mousePos = coords;
            if (state.game.mode === 'boss' && state.bossMode.active && state.bossMode.player.dragging && state.bossMode.phase !== 'reward' && state.bossMode.phase !== 'failed') {
                updateBossDragPosition(e);
                return;
            }
            if (state.game && state.game.selectedShopType) calculateHoveredOrbitAndAngle(coords.x, coords.y);
        });
        canvas.addEventListener('pointerup', (e) => {
            if (state.game.mode === 'boss' && state.bossMode.active) {
                state.bossMode.player.dragging = false;
                state.bossMode.player.dragOffsetX = 0;
                state.bossMode.player.dragOffsetY = 0;
                if (canvas.releasePointerCapture) canvas.releasePointerCapture(e.pointerId);
            }
        });
        canvas.addEventListener('pointercancel', () => {
            if (state.game.mode === 'boss' && state.bossMode.active) {
                state.bossMode.player.dragging = false;
                state.bossMode.player.dragOffsetX = 0;
                state.bossMode.player.dragOffsetY = 0;
            }
        });
        window.addEventListener('keydown', (e) => {
            if (state.game && state.game.mode === 'boss' && state.bossMode.active && !state.game.paused && state.bossMode.phase !== 'reward' && state.bossMode.phase !== 'failed') {
                if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                    e.preventDefault();
                    triggerBossShield();
                }
            }
        });

        bindDismissButton('close-inspect', closeInspector);
        bindDismissButton('close-orbit-inspect', closeOrbitInspector);
        bindDismissButton('close-blueprint', closeBlueprintDrawer);

        // ----------------------------------------------------------------------
        // 11. CORE GAME RENDERING LOOP (With Lightning cascade rendering)
        // ----------------------------------------------------------------------
        function loop(timestamp = performance.now()) {
            requestAnimationFrame(loop);
            if (!lastLoopTimestamp) lastLoopTimestamp = timestamp;
            const elapsed = timestamp - lastLoopTimestamp;
            if (elapsed < TARGET_FRAME_MS - 0.75) return;
            lastLoopTimestamp = timestamp - (elapsed % TARGET_FRAME_MS);

            // Double check canvas scaling hasn't collapsed inside the iframe container context
            const viewportSize = getViewportSize();
            if (Math.abs(canvas.width - viewportSize.width) > 2 || Math.abs(canvas.height - viewportSize.height) > 2) {
                scheduleResizeCanvas();
            }

            const centerX = canvas.width / 2; const centerY = canvas.height / 2;
            updateTutorialTooltips();

            const isWarping = state.game && state.game.mode === 'boss' && state.bossMode && state.bossMode.phase !== 'boss-defeated';
            const steps = (state.game.fastForward && state.game.running && !state.game.paused && state.game.mode === 'defense') ? 2 : 1;

            for (let step = 0; step < steps; step++) {
                updateCosmicBackground(isWarping);

                if (state.game.mode === 'boss' && state.bossMode.active) {
                    if (!state.game.paused && !state.modeTransitionActive && state.bossMode.phase !== 'reward' && state.bossMode.phase !== 'failed' && state.bossMode.phase !== 'transition') {
                        updateBossMode();
                    }
                    for (let i = state.game.particles.length - 1; i >= 0; i--) {
                        state.game.particles[i].update();
                        if (state.game.particles[i].alpha <= 0) state.game.particles.splice(i, 1);
                    }
                } else if (!state.modeTransitionActive) {
                    for (let i = 0; i < state.ORBIT_PATHS.length; i++) {
                        if (!state.orbitLockStates[i] && (!state.game.paused || !state.game.running)) state.orbitRotations[i] += 0.0015 / ((i + 1) * 0.6);
                    }
                    if (state.game.running && !state.game.paused) {
                        if (state.game.tactical) {
                            if (state.game.tactical.overcharge.activeTime > 0) state.game.tactical.overcharge.activeTime -= 1;
                            if (state.game.tactical.laser.cd > 0) state.game.tactical.laser.cd -= 1;
                            if (state.game.tactical.emp.cd > 0) state.game.tactical.emp.cd -= 1;
                            if (state.game.tactical.overcharge.cd > 0) state.game.tactical.overcharge.cd -= 1;
                        }
                        updateTacticalUI();

                        for (let tower of state.game.towers) tower.update(state.game.enemies);

                        if (state.waveActive && state.spawnQueue.length > 0) {
                            state.spawnTimer++;
                            if (state.spawnTimer >= state.spawnQueue[0].delay) {
                                const spawnData = state.spawnQueue.shift();
                                state.game.enemies.push(new Enemy(spawnData.waveNum, spawnData.profileIndex, spawnData.theme, spawnData.isEscort, spawnData.escortIndex, spawnData.escortTotal));
                                state.game.enemiesSpawnedThisWave++; state.spawnTimer = 0;
                            }
                        }

                        for (let i = state.game.enemies.length - 1; i >= 0; i--) {
                            state.game.enemies[i].update();
                            handleEnemyCollisions(state.game.enemies[i], i);
                        }

                        if (state.waveActive && state.spawnQueue.length === 0 && state.game.enemies.length === 0) endWave();

                        for (let i = state.game.projectiles.length - 1; i >= 0; i--) { const proj = state.game.projectiles[i]; proj.update(); if (proj.dead) state.game.projectiles.splice(i, 1); }
                        for (let i = state.game.particles.length - 1; i >= 0; i--) { const part = state.game.particles[i]; part.update(); if (part.alpha <= 0) state.game.particles.splice(i, 1); }

                        for (let index = state.lightningArcsToDraw.length - 1; index >= 0; index--) {
                            state.lightningArcsToDraw[index].alpha -= 0.12;
                            if (state.lightningArcsToDraw[index].alpha <= 0) state.lightningArcsToDraw.splice(index, 1);
                        }
                        for (let index = state.shipAttackBeamsToDraw.length - 1; index >= 0; index--) {
                            state.shipAttackBeamsToDraw[index].alpha -= 0.14;
                            if (state.shipAttackBeamsToDraw[index].alpha <= 0) state.shipAttackBeamsToDraw.splice(index, 1);
                        }
                    }
                }
            }

            // ----- DRAW PHASE -----
            ctx.save();
            if (state.game.running && !state.game.paused && state.game.cameraShake > 0) {
                const shakeX = (Math.random() - 0.5) * state.game.cameraShake;
                const shakeY = (Math.random() - 0.5) * state.game.cameraShake;
                ctx.translate(shakeX, shakeY);
                state.game.cameraShake *= 0.85;
                if (state.game.cameraShake < 0.5) state.game.cameraShake = 0;
            }

            ctx.fillStyle = '#030712'; ctx.fillRect(-30, -30, canvas.width + 60, canvas.height + 60);
            drawCosmicBackgroundOnly(isWarping);

            if (state.game.mode === 'boss' && state.bossMode.active) {
                drawBossMode();
                for (let part of state.game.particles) part.draw();
                drawDamageOverlay(centerX, centerY);
                ctx.restore();
                return;
            }

            const totalRemaining = state.spawnQueue.length + state.game.enemies.length;
            const enemiesCount = document.getElementById('enemies-count'); const enemiesRemaining = document.getElementById('enemies-remaining');
            const mobileActive = document.getElementById('mobile-active'); const mobileRem = document.getElementById('mobile-rem');

            if (enemiesCount) enemiesCount.innerText = `${state.game.enemies.length} ACTIVE`;
            if (enemiesRemaining) enemiesRemaining.innerText = `REMAINING: ${totalRemaining}`;
            if (mobileActive) mobileActive.innerText = state.game.enemies.length;
            if (mobileRem) mobileRem.innerText = totalRemaining;

            for (let i = 0; i < state.ORBIT_PATHS.length; i++) {
                const radius = state.ORBIT_PATHS[i];
                ctx.save(); ctx.lineWidth = 1;

                if (state.orbitLockStates[i]) {
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
                } else if (state.game.orbitGridHighlights && state.game.hoveredOrbitIndex === i) {
                    ctx.strokeStyle = ORBIT_HOVER_COLORS[i]; ctx.shadowBlur = 8; ctx.shadowColor = ORBIT_HOVER_COLORS[i];
                } else {
                    ctx.strokeStyle = ORBIT_COLORS[i];
                }

                ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();

                if (!state.orbitLockStates[i] && state.game.running) {
                    const maxSlots = state.orbitSlotCapacities[i];
                    for (let s = 0; s < maxSlots; s++) {
                        if (!state.game.towers.some(t => t.orbitIndex === i && t.slotIndex === s)) {
                            const angle = state.orbitRotations[i] + s * (2 * Math.PI / maxSlots);
                            const sx = centerX + Math.cos(angle) * radius; const sy = centerY + Math.sin(angle) * radius;

                            ctx.save(); ctx.strokeStyle = state.game.selectedShopType ? 'rgba(190, 242, 100, 0.92)' : 'rgba(255, 255, 255, 0.15)'; ctx.lineWidth = state.game.selectedShopType ? 2.4 : 1.5;
                            if (state.game.selectedShopType) {
                                ctx.setLineDash([4, 4]); const pulse = Math.abs(Math.sin(Date.now() / 180));
                                ctx.fillStyle = `rgba(190, 242, 100, ${0.06 + pulse * 0.08})`;
                                ctx.shadowBlur = 14 + pulse * 10;
                                ctx.shadowColor = '#bef264';
                                ctx.beginPath(); ctx.arc(sx, sy, (13 + pulse * 7) * state.gameScale, 0, Math.PI * 2);
                                ctx.fill();
                            } else {
                                ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.arc(sx, sy, 10 * state.gameScale, 0, Math.PI * 2);
                            }
                            ctx.stroke(); ctx.restore();
                        }
                    }
                }
            }

            if (state.game.selectedShopType && state.game.running) {
                const { closest, dist } = getClosestSlot(state.game.mousePos.x, state.game.mousePos.y);
                if (closest && dist < getSlotTapRadius() && !state.orbitLockStates[closest.orbitIndex]) {
                    if (!state.game.towers.some(t => t.orbitIndex === closest.orbitIndex && t.slotIndex === closest.slotIndex)) {
                        ctx.save(); ctx.globalAlpha = 0.55; drawSatelliteSprite(ctx, state.game.selectedShopType, closest.x, closest.y, 14 * state.gameScale);
                        ctx.strokeStyle = SATELLITE_CONFIGS[state.game.selectedShopType].color + '44'; ctx.setLineDash([4, 4]);
                        ctx.beginPath(); ctx.arc(closest.x, closest.y, SATELLITE_CONFIGS[state.game.selectedShopType].baseRange * state.rangeScale, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
                    }
                }
            }

            drawEarth(centerX, centerY);
            drawFirstDeploymentSlotGuide(getFirstEmptyDeployableSlot());

            for (let tower of state.game.towers) {
                tower.draw();
            }

            if (state.modeTransitionActive) {
                for (let enemy of state.game.enemies) enemy.draw();
                for (let proj of state.game.projectiles) proj.draw();
                for (let part of state.game.particles) part.draw();
                drawDamageOverlay(centerX, centerY);
                ctx.restore();
                return;
            }

            for (let index = state.lightningArcsToDraw.length - 1; index >= 0; index--) {
                const arc = state.lightningArcsToDraw[index];
                ctx.save();
                ctx.globalAlpha = arc.alpha;
                drawLightningArc(ctx, arc.x1, arc.y1, arc.x2, arc.y2);
                ctx.restore();
            }

            for (let index = state.shipAttackBeamsToDraw.length - 1; index >= 0; index--) {
                const beam = state.shipAttackBeamsToDraw[index];
                ctx.save();
                ctx.globalAlpha = beam.alpha;
                ctx.strokeStyle = beam.color;
                ctx.shadowBlur = 8;
                ctx.shadowColor = beam.color;
                ctx.lineWidth = (beam.width || 1.8) * state.gameScale;
                ctx.setLineDash([5, 4]);
                ctx.beginPath();
                ctx.moveTo(beam.x1, beam.y1);
                ctx.lineTo(beam.x2, beam.y2);
                ctx.stroke();
                ctx.restore();
            }

            if (!state.game.running || state.game.paused) {
                for (let enemy of state.game.enemies) enemy.draw();
                for (let proj of state.game.projectiles) proj.draw();
                for (let part of state.game.particles) part.draw();
                drawDamageOverlay(centerX, centerY);
                ctx.restore();
                return;
            }

            for (let enemy of state.game.enemies) enemy.draw();
            for (let proj of state.game.projectiles) proj.draw();
            for (let part of state.game.particles) part.draw();

            drawDamageOverlay(centerX, centerY);
            ctx.restore();
        }

        // Run engine setup and kick off main execution pipeline
        loadSettings();

        const sfxVolInput = document.getElementById('settings-sfx-volume');
        if (sfxVolInput) {
            sfxVolInput.addEventListener('input', (e) => {
                state.sfxVolume = parseFloat(e.target.value);
            });
        }
        const bgmVolInput = document.getElementById('settings-bgm-volume');
        if (bgmVolInput) {
            bgmVolInput.addEventListener('input', (e) => {
                state.bgmVolume = parseFloat(e.target.value);
                if (state.bgmAudio && state.activeBgmKey) {
                    const track = BGM_TRACKS[state.activeBgmKey] || BGM_TRACKS.default;
                    state.bgmAudio.volume = track.volume * state.bgmVolume;
                }
            });
        }
        const pSfxVolInput = document.getElementById('pause-settings-sfx-volume');
        if (pSfxVolInput) {
            pSfxVolInput.addEventListener('input', (e) => {
                state.sfxVolume = parseFloat(e.target.value);
            });
        }
        const pBgmVolInput = document.getElementById('pause-settings-bgm-volume');
        if (pBgmVolInput) {
            pBgmVolInput.addEventListener('input', (e) => {
                state.bgmVolume = parseFloat(e.target.value);
                if (state.bgmAudio && state.activeBgmKey) {
                    const track = BGM_TRACKS[state.activeBgmKey] || BGM_TRACKS.default;
                    state.bgmAudio.volume = track.volume * state.bgmVolume;
                }
            });
        }

        const shakeVolInput = document.getElementById('settings-shake-intensity');
        if (shakeVolInput) {
            shakeVolInput.addEventListener('input', (e) => {
                state.screenShakeIntensity = parseFloat(e.target.value);
            });
        }
        const pShakeVolInput = document.getElementById('pause-settings-shake-intensity');
        if (pShakeVolInput) {
            pShakeVolInput.addEventListener('input', (e) => {
                state.screenShakeIntensity = parseFloat(e.target.value);
            });
        }

        const planetInput = document.getElementById('settings-planet-name');
        if (planetInput) {
            planetInput.addEventListener('input', (e) => {
                const rawName = e.target.value.trim();
                const tempName = rawName !== "" ? rawName.toUpperCase() : "EARTH";
                document.querySelectorAll('.planet-name-label').forEach(lbl => lbl.innerText = tempName);
            });
        }

        const appVersionLabel = document.getElementById('app-version-label');
        if (appVersionLabel) appVersionLabel.innerText = `Version: ${APP_VERSION}`;
        registerPwaSupport();
        syncInstallUI();
        const bootRetryButton = document.getElementById('boot-loader-retry');
        if (bootRetryButton) {
            bootRetryButton.addEventListener('pointerdown', e => {
                e.preventDefault();
                e.stopPropagation();
                bootGame();
            });
        }
        bootGame();
window.state = state; window.startBossMode = startBossMode; window.collectDrop = collectDrop;
