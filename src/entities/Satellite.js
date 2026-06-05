import { state } from '../state.js';
import * as config from '../config.js';
import { getSatelliteMaxHp, getTargetedDamageMultiplier, drawSatelliteSprite } from '../main.js';
import { Projectile } from './Projectile.js';
import { Particle } from './Particle.js';

export class Satellite {
            constructor(type, orbitIndex, slotIndex) {
                this.id = Math.random().toString(36).substring(2, 9);
                this.type = type; this.orbitIndex = orbitIndex; this.slotIndex = slotIndex;
                const cfg = config.SATELLITE_CONFIGS[type];

                this.level = 1;
                this.color = cfg.color; this.baseDamage = cfg.baseDamage; this.baseRange = cfg.baseRange; this.baseCooldown = cfg.baseCooldown;
                this.cooldown = 0; this.target = null; this.x = 0; this.y = 0; this.aimAngle = 0;
                this.maxHp = getSatelliteMaxHp(type); this.hp = this.maxHp;
                this.investedGold = cfg.cost;

                this.beamTicks = 0;
                this.lastTargetId = null;

                this.updateCoordinates();
            }
            get upgradeLevel() { return this.level || 1; }
            get damage() { return Math.floor(this.baseDamage * (1 + (this.upgradeLevel - 1) * 0.32)); }
            get upgradedRange() { return Math.floor(this.baseRange * (1 + (this.upgradeLevel - 1) * 0.11) * state.rangeScale); }
            get baseFireRateCooldown() { return Math.max(5, Math.floor(this.baseCooldown * Math.pow(0.88, this.upgradeLevel - 1))); }
            get effectiveDamage() {
                let multiplier = 1 + state.getDirectiveEffectValue('damage', 0) + (state.research.baseDamage * 0.05);
                const glass = state.getDirectiveEffectValue('glassCannon'); if (glass) multiplier += glass.dmg;
                const rangeTradeoff = state.getDirectiveEffectValue('rangeDamageTradeoff'); if (rangeTradeoff) multiplier -= rangeTradeoff.dmg;
                const corePowered = state.getDirectiveEffectValue('corePowered'); if (corePowered) multiplier += corePowered.dmg;
                const shieldWeapon = state.getDirectiveEffectValue('shieldWeapon'); if (shieldWeapon) multiplier += shieldWeapon.dmg;
                const finalStand = state.getDirectiveEffectValue('finalStand');
                if (finalStand) multiplier += (state.game.earthHealth / state.game.earthMaxHealth) <= finalStand.threshold ? finalStand.low : -finalStand.high;
                if (this.orbitIndex === 1) multiplier += state.getDirectiveEffectValue('middleDamage', 0);
                if (this.type === 'laser') multiplier += state.getDirectiveEffectValue('laserDamage', 0);
                if (this.type === 'plasma') {
                    multiplier += state.getDirectiveEffectValue('plasmaDamage', 0);
                    const plasmaTradeoff = state.getDirectiveEffectValue('plasmaTradeoff'); if (plasmaTradeoff) multiplier += plasmaTradeoff.dmg;
                }
                if (this.type === 'railgun') {
                    multiplier += state.getDirectiveEffectValue('railgunDamage', 0);
                    const railTradeoff = state.getDirectiveEffectValue('railgunUpgradeTradeoff'); if (railTradeoff) multiplier += railTradeoff.dmg;
                }
                const lightningTradeoff = state.getDirectiveEffectValue('lightningTradeoff');
                if (this.type === 'lightningsentry' && lightningTradeoff) multiplier -= lightningTradeoff.dmg;
                return Math.max(1, Math.floor(this.damage * multiplier));
            }
            get range() {
                let multiplier = 1 + state.getDirectiveEffectValue('range', 0);
                if (this.orbitIndex === 2) multiplier += state.getDirectiveEffectValue('outerRange', 0);
                const rangeTradeoff = state.getDirectiveEffectValue('rangeDamageTradeoff'); if (rangeTradeoff) multiplier += rangeTradeoff.range;
                const magnetTradeoff = state.getDirectiveEffectValue('magnetTradeoff'); if (this.type === 'magnetsentry' && magnetTradeoff) multiplier -= magnetTradeoff.range;
                const compression = state.getDirectiveEffectValue('orbitCompression'); if (this.orbitIndex === 2 && compression) multiplier -= compression.range;
                if (state.game.hazard === 'Debris Field') multiplier *= 0.7;
                return Math.max(40, Math.floor(this.upgradedRange * multiplier));
            }
            get fireRateCooldown() {
                let multiplier = 1 - state.getDirectiveEffectValue('fireRate', 0);
                const overdrive = state.getDirectiveEffectValue('overdriveRepair'); if (overdrive) multiplier -= overdrive.rate;
                const corePowered = state.getDirectiveEffectValue('corePowered'); if (corePowered) multiplier -= corePowered.rate;
                const lastStand = state.getDirectiveEffectValue('lastStandRate');
                if (lastStand && state.game.earthHealth / state.game.earthMaxHealth <= 0.3) multiplier -= lastStand;
                if (this.orbitIndex === 0) multiplier -= state.getDirectiveEffectValue('innerRate', 0);
                const compression = state.getDirectiveEffectValue('orbitCompression'); if (this.orbitIndex === 0 && compression) multiplier -= compression.rate;
                const plasmaTradeoff = state.getDirectiveEffectValue('plasmaTradeoff'); if (this.type === 'plasma' && plasmaTradeoff) multiplier += plasmaTradeoff.cd;
                const missileTradeoff = state.getDirectiveEffectValue('missileTradeoff'); if (this.type === 'missile' && missileTradeoff) multiplier += missileTradeoff.rate;
                if (state.game.hazard === 'Solar Flare') multiplier *= 2.0;
                if (state.game.tactical && state.game.tactical.overcharge.activeTime > 0) multiplier *= 0.5;
                return Math.max(2, Math.floor(this.baseFireRateCooldown * Math.max(0.2, multiplier)));
            }

            updateCoordinates() {
                const centerX = state.canvas.width / 2; const centerY = state.canvas.height / 2;
                const radius = state.ORBIT_PATHS[this.orbitIndex] || 100;
                const maxSlots = state.orbitSlotCapacities[this.orbitIndex];
                const angle = state.orbitRotations[this.orbitIndex] + this.slotIndex * (2 * Math.PI / maxSlots);
                this.x = centerX + Math.cos(angle) * radius; this.y = centerY + Math.sin(angle) * radius;
                if (!this.target) this.aimAngle = Math.atan2(this.y - centerY, this.x - centerX);
            }
            update(enemies, speedMultiplier = 1) {
                this.updateCoordinates();

                if (this.type === 'magnetsentry') {
                    const magnetSlowTo = state.getDirectiveEffectValue('magnetSlowTo', 0.65);
                    const magnetTradeoff = state.getDirectiveEffectValue('magnetTradeoff');
                    const slowMultiplier = magnetTradeoff ? magnetTradeoff.slow : magnetSlowTo;
                    for (let enemy of enemies) {
                        const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                        if (distance < this.range) {
                            enemy.slowMultiplier = Math.min(enemy.slowMultiplier, slowMultiplier);
                            enemy.slowTimer = Math.max(enemy.slowTimer, 10);
                        }
                    }
                }

                let closestEnemy = null;
                let minDist = this.range;
                for (let enemy of enemies) {
                    const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                    if (dist < minDist) { minDist = dist; closestEnemy = enemy; }
                }

                if (this.type === 'lasersentry') {
                    if (closestEnemy) {
                        this.target = closestEnemy;
                        if (this.lastTargetId === closestEnemy.id) {
                            this.beamTicks++;
                        } else {
                            this.beamTicks = 0;
                            this.lastTargetId = closestEnemy.id;
                        }
                    } else {
                        this.target = null;
                        this.beamTicks = 0;
                        this.lastTargetId = null;
                    }
                } else {
                    this.target = closestEnemy;
                }
                if (this.target && state.game.enemies.includes(this.target)) {
                    this.aimAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                }

                if (this.cooldown > 0) this.cooldown -= speedMultiplier;
                // --- AFFIX: disableTimer (from Jammer or Glacial freeze) ---
                if (this.disableTimer > 0) {
                    this.disableTimer -= speedMultiplier;
                    return; // Cannot fire while disabled
                }
                if (this.cooldown === 0) {
                    if (this.target && state.game.enemies.includes(this.target)) {
                        this.fire(this.target);
                        this.cooldown = this.fireRateCooldown;
                    }
                }
            }
            fire(enemy) {
                state.playSynthSound(this.type);

                // Shared helper: applies shielded absorption + mirror reflect + reactive stacking
                const applyAffixDamage = (e, dmg) => {
                    if (e.affix && e.affix.id === 'shielded' && e.shield > 0) {
                        const overflow = Math.max(0, dmg - e.shield);
                        e.shield = Math.max(0, e.shield - dmg);
                        if (e.shield <= 0) { state.playSynthSound('explosion'); state.createExplosion(e.x, e.y, '#38bdf8', 12); }
                        if (overflow > 0) e.hp -= overflow;
                    } else { e.hp -= dmg; }
                    if (e.affix && e.affix.id === 'mirror' && dmg > 0) {
                        const reflectDmg = Math.max(1, Math.floor(dmg * (e.mirrorPercent || 0.15)));
                        if (state.game.towers.includes(this)) {
                            this.hp = Math.max(0, this.hp - reflectDmg);
                            state.shipAttackBeamsToDraw.push({ x1: e.x, y1: e.y, x2: this.x, y2: this.y, color: '#e2e8f0', alpha: 1, width: 1.2 });
                            if (this.hp <= 0) {
                                state.createExplosion(this.x, this.y, '#ef4444', 18);
                                state.game.towers = state.game.towers.filter(t => t.id !== this.id);
                            }
                        }
                    }
                };

                if (this.type === 'lasersentry') {
                    const rampBoost = 1 + state.getDirectiveEffectValue('laserRamp', 0) + (state.getDirectiveEffectValue('laserOverfocus') ? state.getDirectiveEffectValue('laserOverfocus').ramp : 0);
                    const focusBoost = this.beamTicks >= 120 ? state.getDirectiveEffectValue('laserFocus', 0) : 0;
                    const rampMultiplier = 1 + Math.min(120, this.beamTicks) * 0.05 * rampBoost + focusBoost;
                    const rampedDmg = Math.floor(this.effectiveDamage * rampMultiplier * getTargetedDamageMultiplier(enemy, this.type));
                    applyAffixDamage(enemy, rampedDmg);

                    if (Math.random() < 0.3) {
                        state.createExplosion(enemy.x, enemy.y, '#22d3ee', 1);
                    }
                } else if (this.type === 'lightningsentry') {
                    applyAffixDamage(enemy, Math.floor(this.effectiveDamage * getTargetedDamageMultiplier(enemy, this.type)));
                    state.createExplosion(enemy.x, enemy.y, '#fbbf24', 5);

                    state.lightningArcsToDraw.push({
                        x1: this.x, y1: this.y,
                        x2: enemy.x, y2: enemy.y,
                        alpha: 1.0
                    });

                    let chainTargets = [enemy];
                    let currentTarget = enemy;
                    const bounceRadius = 120 * state.rangeScale;
                    const relayChains = state.getDirectiveEffectValue('lightningChains', 0);
                    const stormRelay = state.getDirectiveEffectValue('lightningTradeoff');
                    const maxChains = 3 + relayChains + (stormRelay ? stormRelay.chains : 0);
                    for (let b = 0; b < maxChains; b++) {
                        let nextTarget = null;
                        let closestDist = bounceRadius;
                        for (let other of state.game.enemies) {
                            if (chainTargets.includes(other)) continue;
                            const d = Math.hypot(other.x - currentTarget.x, other.y - currentTarget.y);
                            if (d < closestDist) {
                                closestDist = d;
                                nextTarget = other;
                            }
                        }
                        if (nextTarget) {
                            chainTargets.push(nextTarget);
                            const cascadeDamage = Math.floor(this.effectiveDamage * Math.pow(0.75, b + 1) * getTargetedDamageMultiplier(nextTarget, this.type));
                            applyAffixDamage(nextTarget, cascadeDamage);
                            state.createExplosion(nextTarget.x, nextTarget.y, '#fbbf24', 3);

                            state.lightningArcsToDraw.push({
                                x1: currentTarget.x, y1: currentTarget.y,
                                x2: nextTarget.x, y2: nextTarget.y,
                                alpha: 1.0
                            });
                            currentTarget = nextTarget;
                        } else {
                            break;
                        }
                    }
                } else {
                    const bulletSpeed = config.SATELLITE_CONFIGS[this.type].projSpeed * state.gameScale;
                    state.game.projectiles.push(new Projectile(this.x, this.y, enemy, this.type, this.effectiveDamage, bulletSpeed, this.range, this));
                }
            }
            draw() {
                const isSelected = state.game.selectedTower && state.game.selectedTower.id === this.id;

                if (this.type === 'magnetsentry') {
                    state.ctx.save();
                    state.ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
                    state.ctx.fillStyle = 'rgba(56, 189, 248, 0.02)';
                    state.ctx.beginPath();
                    state.ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
                    state.ctx.fill();
                    state.ctx.stroke();

                    const wavePeriod = 1600;
                    const progress = (Date.now() % wavePeriod) / wavePeriod;
                    const waveRadius = this.range * progress;

                    state.ctx.strokeStyle = `rgba(56, 189, 248, ${0.28 * (1 - progress)})`;
                    state.ctx.lineWidth = 1.6;
                    state.ctx.beginPath();
                    state.ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
                    state.ctx.stroke();
                    state.ctx.restore();
                }

                if (this.type === 'lasersentry' && this.target && state.game.enemies.includes(this.target)) {
                    state.ctx.save();
                    state.ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
                    state.ctx.lineWidth = (2 + Math.min(5, this.beamTicks * 0.05)) * state.gameScale;
                    state.ctx.beginPath();
                    state.ctx.moveTo(this.x, this.y);
                    state.ctx.lineTo(this.target.x, this.target.y);
                    state.ctx.stroke();

                    state.ctx.strokeStyle = '#ffffff';
                    state.ctx.lineWidth = (0.7 + Math.min(1.8, this.beamTicks * 0.015)) * state.gameScale;
                    state.ctx.shadowBlur = 6;
                    state.ctx.shadowColor = '#22d3ee';
                    state.ctx.beginPath();
                    state.ctx.moveTo(this.x, this.y);
                    state.ctx.lineTo(this.target.x, this.target.y);
                    state.ctx.stroke();
                    state.ctx.restore();
                }

                if (isSelected) {
                    state.ctx.save(); state.ctx.strokeStyle = this.color + '33'; state.ctx.fillStyle = this.color + '0a'; state.ctx.lineWidth = 1;
                    state.ctx.setLineDash([5, 5]); state.ctx.beginPath(); state.ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2); state.ctx.fill(); state.ctx.stroke(); state.ctx.restore();
                }
                drawSatelliteSprite(state.ctx, this.type, this.x, this.y, 14 * state.gameScale, this.aimAngle);
                const badgeRadius = Math.max(7, 8 * state.gameScale);
                const badgeX = this.x + 13 * state.gameScale;
                const badgeY = this.y - 17 * state.gameScale;
                state.ctx.save();

                if (this.hp / this.maxHp <= 0.5 && Math.random() < 0.1) {
                    state.game.particles.push(new Particle(this.x + (Math.random() * 20 - 10) * state.gameScale, this.y + (Math.random() * 20 - 10) * state.gameScale, '#64748b'));
                }
                if (this.hp / this.maxHp <= 0.2 && Math.random() < 0.05) {
                    state.game.particles.push(new Particle(this.x + (Math.random() * 20 - 10) * state.gameScale, this.y + (Math.random() * 20 - 10) * state.gameScale, '#facc15'));
                }

                state.ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
                state.ctx.strokeStyle = '#fbbf24';
                state.ctx.lineWidth = 1.4;
                state.ctx.shadowBlur = 8;
                state.ctx.shadowColor = '#f59e0b';
                state.ctx.beginPath();
                state.ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
                state.ctx.fill();
                state.ctx.stroke();
                state.ctx.shadowBlur = 0;
                state.ctx.fillStyle = '#fde68a';
                state.ctx.font = `900 ${Math.max(8, Math.floor(9 * state.gameScale))}px Orbitron`;
                state.ctx.textAlign = 'center';
                state.ctx.textBaseline = 'middle';
                state.ctx.fillText(this.upgradeLevel, badgeX, badgeY + 0.5);
                state.ctx.restore();
                if (this.hp < this.maxHp) {
                    const barW = 32 * state.gameScale; const barH = 3 * state.gameScale;
                    state.ctx.save();
                    state.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                    state.ctx.fillRect(this.x - barW / 2, this.y - 24 * state.gameScale, barW, barH);
                    state.ctx.fillStyle = '#f97316';
                    state.ctx.fillRect(this.x - barW / 2, this.y - 24 * state.gameScale, barW * (this.hp / this.maxHp), barH);
                    state.ctx.restore();
                }
                // --- Disabled indicator from Jammer/Glacial ---
                if (this.disableTimer > 0) {
                    state.ctx.save();
                    state.ctx.globalAlpha = 0.75;
                    state.ctx.fillStyle = 'rgba(125,211,252,0.25)';
                    state.ctx.strokeStyle = '#7dd3fc';
                    state.ctx.lineWidth = 2;
                    state.ctx.shadowBlur = 12;
                    state.ctx.shadowColor = '#7dd3fc';
                    state.ctx.beginPath();
                    state.ctx.arc(this.x, this.y, 16 * state.gameScale, 0, Math.PI * 2);
                    state.ctx.fill();
                    state.ctx.stroke();
                    state.ctx.globalAlpha = 1;
                    state.ctx.restore();
                }
                if (isSelected) {
                    state.ctx.save(); state.ctx.strokeStyle = '#f59e0b'; state.ctx.lineWidth = 2; state.ctx.beginPath(); state.ctx.arc(this.x, this.y, 18 * state.gameScale, 0, Math.PI * 2); state.ctx.stroke();
                    state.ctx.fillStyle = '#f59e0b'; state.ctx.font = 'bold 9px Orbitron'; state.ctx.textAlign = 'center';
                    state.ctx.fillText('LEVEL: ' + this.upgradeLevel, this.x, this.y + 28 * state.gameScale); state.ctx.restore();
                }
            }
        }
