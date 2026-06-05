import { state } from '../state.js';
import * as config from '../config.js';
import { damageSatellite, damageEarth, showGameNotice, drawEnemySprite } from '../main.js';

export class Enemy {
            constructor(wave, profileIndex, theme, isEscort = false, escortIndex = 0, escortTotal = 1, affix = null) {
                this.id = Math.random().toString(36).substring(2, 9);
                const profile = config.ENEMY_PROFILES[profileIndex];
                const difficultyWave = Math.max(0, wave - 1);

                this.type = profile.type; this.category = profile.category; this.color = profile.color;
                this.size = profile.size * state.gameScale;
                this.baseSpeed = profile.speed * (1 + (difficultyWave * 0.015)) * state.gameScale;

                this.maxHp = Math.floor(profile.maxHp * Math.pow(1.06, difficultyWave));
                this.baseDamage = profile.damage;
                this.damage = profile.damage + Math.floor(difficultyWave * 1.15);
                this.goldReward = Math.floor(profile.goldReward * Math.pow(1.04, difficultyWave));

                this.isVeteran = wave >= 10 && Math.random() < 0.15;
                if (this.isVeteran) {
                    this.maxHp = Math.floor(this.maxHp * 1.5);
                    this.goldReward *= 2;
                }

                if (theme === 'Fighter Squadron') {
                    this.baseSpeed *= 1.25;
                } else if (theme === 'Juggernauts') {
                    this.maxHp = Math.floor(this.maxHp * 1.5);
                    this.baseSpeed *= 0.8;
                }

                const rewardHpTradeoff = state.getDirectiveEffectValue('rewardHpTradeoff');
                if (rewardHpTradeoff) this.maxHp = Math.floor(this.maxHp * (1 + rewardHpTradeoff.hp));
                if (this.category === 'normal') {
                    const rockRewardSpeed = state.getDirectiveEffectValue('rockRewardSpeed');
                    if (rockRewardSpeed) this.baseSpeed *= (1 + rockRewardSpeed.speed);
                }

                this.isEscort = isEscort;
                if (this.isEscort) {
                    if (escortTotal <= 1) {
                        this.escortOffsetAngle = 0;
                    } else {
                        this.escortOffsetAngle = -Math.PI / 2 + (escortIndex / (escortTotal - 1)) * Math.PI;
                    }
                }
                if (this.category === 'miniboss') {
                    this.specialCooldown = 180;
                }

                // --- AFFIX SYSTEM ---
                // Only apply affix if this enemy's category matches (or affix is 'both')
                this.affix = null;
                if (affix) {
                    const matchesCategory =
                        affix.category === 'both' ||
                        (affix.category === 'rock' && this.category === 'normal') ||
                        (affix.category === 'ship' && (this.category === 'ship' || this.category === 'miniboss'));

                    if (matchesCategory) {
                        this.affix = affix;

                        if (affix.id === 'ironclad') {
                            this.isSlowImmune = true;
                        }
                        if (affix.id === 'fissured') {
                            this.isFissured = true;
                        }
                        if (affix.id === 'volatile') {
                            this.isVolatile = true;
                        }
                        if (affix.id === 'glacial') {
                            this.isGlacial = true;
                        }
                        if (affix.id === 'reactive') {
                            this.reactiveStacks = 0;
                            this._lastHpForReactive = this.maxHp;
                        }
                        if (affix.id === 'shielded') {
                            this.shield = Math.floor(this.maxHp * 0.30);
                            this.maxShield = this.shield;
                        }
                        if (affix.id === 'jammer') {
                            this.jammerCooldown = 480; // 8 seconds at 60fps
                        }
                        if (affix.id === 'berserk') {
                            this.isBerserk = true;
                        }
                        if (affix.id === 'commander') {
                            this.isCommander = true;
                            this.commandAuraRadius = this.size * 8;
                        }
                        if (affix.id === 'mirror') {
                            this.mirrorPercent = 0.15;
                        }
                        if (affix.id === 'gilded') {
                            this.maxHp = Math.floor(this.maxHp * 2);
                            this.isGilded = true;
                        }
                    }
                }
                // ------------------

                this.speed = this.baseSpeed;
                this.hp = this.maxHp;
                this.attackRange = (profile.attackRange || 0) * state.rangeScale;
                this.attackCooldownMax = profile.attackCooldown || 0;
                if (this.isVeteran && this.attackCooldownMax) this.attackCooldownMax = Math.floor(this.attackCooldownMax * 0.7);
                this.attackCooldown = Math.floor(Math.random() * Math.max(1, this.attackCooldownMax));
                this.targetTower = null;

                const angle = Math.random() * Math.PI * 2;
                const distance = Math.max(state.canvas.width, state.canvas.height) / 2 + 100;
                this.x = state.canvas.width / 2 + Math.cos(angle) * distance;
                this.y = state.canvas.height / 2 + Math.sin(angle) * distance;
                this.angle = Math.atan2(state.canvas.height / 2 - this.y, state.canvas.width / 2 - this.x);
                this.pulseTimer = Math.random() * 100;
                this.isRockEnemy = this.type === 'Meteoroid' || this.type === 'Meteor' || this.type === 'Asteroid' || this.type === 'Comet';
                this.spinAngle = Math.random() * Math.PI * 2;
                this.spinSpeed = (Math.random() * 0.035 + 0.015) * (Math.random() < 0.5 ? -1 : 1);

                this.slowMultiplier = 1;
                this.slowTimer = 0;

                if (this.isEscort) {
                    let boss = state.game.enemies.find(e => e.category === 'miniboss');
                    if (boss) {
                        const orbitRadius = boss.size + this.size + 30 * state.gameScale;
                        this.x = boss.x + Math.cos(boss.angle + this.escortOffsetAngle) * orbitRadius;
                        this.y = boss.y + Math.sin(boss.angle + this.escortOffsetAngle) * orbitRadius;
                        this.angle = boss.angle;
                    }
                }
            }

            update(speedMultiplier = 1) {
                if (this.slowTimer > 0) {
                    this.slowTimer -= speedMultiplier;
                    if (this.slowTimer <= 0) {
                        this.slowMultiplier = 1;
                    }
                }

                // --- AFFIX: Ironclad — immune to slowing ---
                if (this.isSlowImmune) {
                    this.slowMultiplier = 1;
                    this.slowTimer = 0;
                }

                // --- AFFIX: Reactive — each hit adds speed stacks ---
                if (this.affix && this.affix.id === 'reactive') {
                    if (this.hp < this._lastHpForReactive) {
                        this.reactiveStacks = Math.min(12, this.reactiveStacks + 1);
                        this._lastHpForReactive = this.hp;
                        this.baseSpeed = (config.ENEMY_PROFILES.find(p => p.type === this.type)?.speed || 1)
                            * state.gameScale
                            * (1 + this.reactiveStacks * 0.05);
                    }
                }

                // --- AFFIX: Berserk — scales speed + attack with damage taken ---
                if (this.isBerserk && this.maxHp > 0) {
                    const missingHpFraction = 1 - (this.hp / this.maxHp);
                    const berserkBonus = missingHpFraction * 0.60; // up to +60%
                    const baseProfileSpeed = (config.ENEMY_PROFILES.find(p => p.type === this.type)?.speed || 1) * state.gameScale;
                    this.baseSpeed = baseProfileSpeed * (1 + berserkBonus);
                    if (this.attackCooldownMax > 0) {
                        const baseProfileCd = config.ENEMY_PROFILES.find(p => p.type === this.type)?.attackCooldown || this.attackCooldownMax;
                        this.attackCooldownMax = Math.max(8, Math.floor(baseProfileCd * (1 - berserkBonus * 0.6)));
                    }
                }

                // --- AFFIX: Jammer — disables nearest satellite periodically ---
                if (this.affix && this.affix.id === 'jammer') {
                    if (this.jammerCooldown > 0) {
                        this.jammerCooldown -= speedMultiplier;
                    } else {
                        this.jammerCooldown = 480;
                        let nearest = null; let nearestDist = Infinity;
                        const jamRange = this.size * 20;
                        for (const tower of state.game.towers) {
                            const d = Math.hypot(tower.x - this.x, tower.y - this.y);
                            if (d < nearestDist && d <= jamRange) { nearestDist = d; nearest = tower; }
                        }
                        if (nearest) {
                            nearest.disableTimer = 150; // 2.5 seconds
                            state.createExplosion(nearest.x, nearest.y, '#a78bfa', 8);
                            state.shipAttackBeamsToDraw.push({ x1: this.x, y1: this.y, x2: nearest.x, y2: nearest.y, color: '#a78bfa', alpha: 1, width: 2 });
                            showGameNotice('<i class="fa-solid fa-wifi text-purple-400"></i> JAMMER — Satellite disabled!', 2500);
                        }
                    }
                }

                // --- AFFIX: Commander — boost nearby enemies ---
                if (this.isCommander) {
                    for (const e of state.game.enemies) {
                        if (e === this) continue;
                        const d = Math.hypot(e.x - this.x, e.y - this.y);
                        if (d <= this.commandAuraRadius) {
                            e._commanderBoosted = true;
                        } else {
                            e._commanderBoosted = false;
                        }
                    }
                }

                const centerX = state.canvas.width / 2; const centerY = state.canvas.height / 2;
                let targetX = centerX; let targetY = centerY;
                this.targetTower = null;

                if (this.isEscort) {
                    let boss = state.game.enemies.find(e => e.category === 'miniboss');
                    if (boss) {
                        const orbitRadius = boss.size + this.size + 30 * state.gameScale;
                        targetX = boss.x + Math.cos(boss.angle + this.escortOffsetAngle) * orbitRadius;
                        targetY = boss.y + Math.sin(boss.angle + this.escortOffsetAngle) * orbitRadius;

                        const distToOrbit = Math.hypot(targetX - this.x, targetY - this.y);
                        if (distToOrbit > 0) {
                            const currentSpeed = this.baseSpeed * this.slowMultiplier * 1.5 * speedMultiplier;
                            if (distToOrbit < currentSpeed) {
                                this.x = targetX; this.y = targetY;
                            } else {
                                this.x += (targetX - this.x) / distToOrbit * currentSpeed;
                                this.y += (targetY - this.y) / distToOrbit * currentSpeed;
                            }
                        }

                        let nearestTower = null; let nearestDist = Infinity;
                        for (const tower of state.game.towers) {
                            const towerDist = Math.hypot(tower.x - this.x, tower.y - this.y);
                            if (towerDist < nearestDist) { nearestDist = towerDist; nearestTower = tower; }
                        }
                        if (nearestTower && nearestDist <= this.attackRange) {
                            this.targetTower = nearestTower;
                            this.angle = Math.atan2(this.targetTower.y - this.y, this.targetTower.x - this.x);
                            if (this.attackCooldown > 0) this.attackCooldown -= speedMultiplier;
                            if (this.attackCooldown <= 0) {
                                damageSatellite(this.targetTower, this.damage, this.category);
                                state.createExplosion(this.targetTower.x, this.targetTower.y, this.color, 4);
                                state.shipAttackBeamsToDraw.push({ x1: this.x, y1: this.y, x2: this.targetTower.x, y2: this.targetTower.y, color: this.color, alpha: 1, width: 1.8 });
                                state.playSynthSound('hit');
                                this.attackCooldown = this.attackCooldownMax;
                            }
                        } else {
                            this.angle = Math.atan2(state.canvas.height / 2 - this.y, state.canvas.width / 2 - this.x);
                        }
                        this.pulseTimer += 0.05 * speedMultiplier;
                        return;
                    }
                }

                if (this.category === 'ship' || this.category === 'miniboss') {
                    let nearestTower = null; let nearestDist = Infinity;
                    for (const tower of state.game.towers) {
                        const towerDist = Math.hypot(tower.x - this.x, tower.y - this.y);
                        if (towerDist < nearestDist) { nearestDist = towerDist; nearestTower = tower; }
                    }
                    if (nearestTower) {
                        this.targetTower = nearestTower;
                        targetX = nearestTower.x; targetY = nearestTower.y;
                    } else if (this.category === 'miniboss') {
                        targetX = centerX; targetY = centerY;
                    }
                }

                const distToTarget = Math.hypot(targetX - this.x, targetY - this.y);
                this.angle = Math.atan2(targetY - this.y, targetX - this.x);

                let isAttacking = false;
                if (this.targetTower && distToTarget <= this.attackRange) {
                    isAttacking = true;
                    if (this.attackCooldown > 0) this.attackCooldown -= speedMultiplier;
                    if (this.attackCooldown <= 0) {
                        damageSatellite(this.targetTower, this.damage, this.category);
                        state.createExplosion(this.targetTower.x, this.targetTower.y, this.color, 4);
                        state.shipAttackBeamsToDraw.push({ x1: this.x, y1: this.y, x2: this.targetTower.x, y2: this.targetTower.y, color: this.color, alpha: 1, width: 1.8 });
                        state.playSynthSound('hit');
                        this.attackCooldown = this.attackCooldownMax;
                    }
                } else if (this.category === 'miniboss' && !this.targetTower && distToTarget <= this.attackRange + state.EARTH_RADIUS) {
                    isAttacking = true;
                    if (this.attackCooldown > 0) this.attackCooldown -= speedMultiplier;
                    if (this.attackCooldown <= 0) {
                        damageEarth(this.damage);
                        state.createExplosion(centerX, centerY, this.color, 8);
                        state.shipAttackBeamsToDraw.push({ x1: this.x, y1: this.y, x2: centerX, y2: centerY, color: this.color, alpha: 1, width: 2.5 });
                        this.attackCooldown = this.attackCooldownMax;
                    }
                }

                if (this.category === 'miniboss') {
                    if (this.specialCooldown > 0) this.specialCooldown -= speedMultiplier;
                    if (this.specialCooldown <= 0) {
                        this.specialCooldown = 300;
                        if (this.targetTower) {
                            damageSatellite(this.targetTower, this.damage * 2.5, this.category);
                            state.createExplosion(this.targetTower.x, this.targetTower.y, '#ef4444', 20);
                            state.shipAttackBeamsToDraw.push({ x1: this.x, y1: this.y, x2: this.targetTower.x, y2: this.targetTower.y, color: '#ef4444', alpha: 1, width: 6 });
                            showGameNotice('<i class="fa-solid fa-radiation mr-1"></i> Mini-Boss unleashed devastating satellite strike!', 3000);
                        } else {
                            damageEarth(this.damage * 2.5);
                            state.createExplosion(centerX, centerY, '#ef4444', 20);
                            state.shipAttackBeamsToDraw.push({ x1: this.x, y1: this.y, x2: centerX, y2: centerY, color: '#ef4444', alpha: 1, width: 6 });
                            showGameNotice('<i class="fa-solid fa-radiation mr-1"></i> Mini-Boss unleashed devastating core strike!', 3000);
                        }
                    }
                }

                if (isAttacking) {
                    this.pulseTimer += 0.05 * speedMultiplier;
                    return;
                }

                const currentSpeed = this.baseSpeed * this.slowMultiplier * speedMultiplier;
                if (distToTarget > 0) {
                    this.x += (targetX - this.x) / distToTarget * currentSpeed;
                    this.y += (targetY - this.y) / distToTarget * currentSpeed;
                    if (this.isRockEnemy) this.spinAngle += this.spinSpeed * Math.max(0.25, this.slowMultiplier) * speedMultiplier;
                }
                this.pulseTimer += 0.05 * speedMultiplier;
            }

            draw() {
                const renderAngle = this.isRockEnemy ? this.spinAngle : this.angle;
                if (!drawEnemySprite(state.ctx, this.type, this.x, this.y, this.size, renderAngle)) {
                    state.ctx.save(); state.ctx.translate(this.x, this.y); state.ctx.rotate(renderAngle);
                    state.ctx.shadowBlur = 8; state.ctx.shadowColor = this.color; state.ctx.fillStyle = this.color;

                    if (this.type === 'Meteoroid' || this.type === 'Meteor' || this.type === 'Asteroid') {
                        state.ctx.beginPath(); state.ctx.moveTo(this.size, 0); state.ctx.lineTo(this.size * 0.3, this.size * 0.8); state.ctx.lineTo(-this.size * 0.8, this.size * 0.5);
                        state.ctx.lineTo(-this.size * 0.8, -this.size * 0.5); state.ctx.lineTo(this.size * 0.3, -this.size * 0.8); state.ctx.closePath(); state.ctx.fill();
                        if (this.type === 'Asteroid') {
                            state.ctx.strokeStyle = '#e5e7eb'; state.ctx.lineWidth = 1;
                            state.ctx.beginPath(); state.ctx.moveTo(-this.size * 0.2, -this.size * 0.35); state.ctx.lineTo(this.size * 0.25, this.size * 0.25); state.ctx.stroke();
                        }
                    } else if (this.type === 'Comet') {
                        state.ctx.fillStyle = '#67e8f9';
                        state.ctx.beginPath(); state.ctx.arc(0, 0, this.size * 0.75, 0, Math.PI * 2); state.ctx.fill();
                        state.ctx.fillStyle = 'rgba(103, 232, 249, 0.35)';
                        state.ctx.beginPath(); state.ctx.moveTo(-this.size * 0.4, 0); state.ctx.lineTo(-this.size * 2.1, -this.size * 0.8); state.ctx.lineTo(-this.size * 2.1, this.size * 0.8); state.ctx.closePath(); state.ctx.fill();
                    } else if (this.type === 'Scout Fighter') {
                        state.ctx.beginPath(); state.ctx.moveTo(this.size * 1.2, 0); state.ctx.lineTo(-this.size * 0.6, this.size * 0.8); state.ctx.lineTo(-this.size * 0.2, this.size * 0.3);
                        state.ctx.lineTo(-this.size * 0.2, -this.size * 0.3); state.ctx.lineTo(-this.size * 0.6, -this.size * 0.8); state.ctx.closePath(); state.ctx.fill();
                    } else if (this.type === 'Void Swarmer') {
                        state.ctx.beginPath(); state.ctx.moveTo(this.size * 1.1, 0); state.ctx.lineTo(-this.size * 0.6, this.size * 0.6); state.ctx.lineTo(-this.size * 0.2, 0);
                        state.ctx.lineTo(-this.size * 0.6, -this.size * 0.6); state.ctx.closePath(); state.ctx.fill();
                    } else if (this.type === 'Armored Cruiser') {
                        state.ctx.beginPath(); state.ctx.moveTo(this.size * 1.4, 0); state.ctx.lineTo(this.size * 0.2, this.size * 0.6); state.ctx.lineTo(-this.size * 0.8, this.size * 0.9);
                        state.ctx.lineTo(-this.size * 0.8, -this.size * 0.9); state.ctx.lineTo(this.size * 0.2, -this.size * 0.6); state.ctx.closePath(); state.ctx.fill();
                        state.ctx.fillStyle = '#ef4444'; state.ctx.fillRect(-this.size, -this.size * 0.3, 2, this.size * 0.6);
                    } else {
                        state.ctx.beginPath(); state.ctx.arc(0, 0, this.size, 0, Math.PI * 2); state.ctx.fill();
                        state.ctx.strokeStyle = '#fff'; state.ctx.lineWidth = 1;
                        state.ctx.beginPath(); state.ctx.arc(0, 0, this.size * 1.3, this.pulseTimer, this.pulseTimer + Math.PI / 2); state.ctx.stroke();
                        state.ctx.beginPath(); state.ctx.arc(0, 0, this.size * 1.3, this.pulseTimer + Math.PI, this.pulseTimer + Math.PI * 1.5); state.ctx.stroke();
                    }
                    state.ctx.restore();
                }

                if (this.isVeteran) {
                    state.ctx.save();
                    state.ctx.shadowBlur = 15;
                    state.ctx.shadowColor = '#ef4444';
                    state.ctx.strokeStyle = '#ef4444';
                    state.ctx.lineWidth = 2;
                    state.ctx.beginPath();
                    state.ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
                    state.ctx.stroke();
                    state.ctx.restore();
                }

                if (this.slowMultiplier < 1) {
                    state.ctx.save();
                    state.ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
                    state.ctx.lineWidth = 2;
                    state.ctx.setLineDash([2, 2]);
                    state.ctx.beginPath();
                    state.ctx.arc(this.x, this.y, this.size + 4, 0, Math.PI * 2);
                    state.ctx.stroke();
                    state.ctx.restore();
                }

                // ======================================================
                // AFFIX VISUAL OVERLAYS
                // ======================================================
                if (this.affix) {
                    const ctx = state.ctx;
                    const t = this.pulseTimer;
                    const r = this.size;

                    // --- Ironclad: silver metallic ring ---
                    if (this.affix.id === 'ironclad') {
                        ctx.save();
                        ctx.shadowBlur = 6; ctx.shadowColor = '#cbd5e1';
                        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2.5;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 1.6, 0, Math.PI * 2); ctx.stroke();
                        ctx.strokeStyle = 'rgba(203,213,225,0.35)'; ctx.lineWidth = 5;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 1.9, 0, Math.PI * 2); ctx.stroke();
                        ctx.restore();
                    }

                    // --- Reactive: yellow electric sparks scaling with stacks ---
                    if (this.affix.id === 'reactive') {
                        const intensity = Math.min(1, (this.reactiveStacks || 0) / 12);
                        if (intensity > 0) {
                            ctx.save();
                            ctx.shadowBlur = 10 + intensity * 15; ctx.shadowColor = '#facc15';
                            ctx.strokeStyle = `rgba(250,204,21,${0.4 + intensity * 0.6})`; ctx.lineWidth = 1.5 + intensity * 2;
                            ctx.beginPath(); ctx.arc(this.x, this.y, r * (1.4 + intensity * 0.4) + Math.sin(t * 3) * 2, 0, Math.PI * 2); ctx.stroke();
                            ctx.restore();
                        }
                    }

                    // --- Volatile: pulsing crimson outer glow ---
                    if (this.affix.id === 'volatile') {
                        const pulse = 0.5 + Math.sin(t * 2) * 0.5;
                        ctx.save();
                        ctx.shadowBlur = 15 * pulse; ctx.shadowColor = '#f97316';
                        ctx.strokeStyle = `rgba(249,115,22,${0.5 + pulse * 0.5})`; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 1.7 + pulse * 3, 0, Math.PI * 2); ctx.stroke();
                        ctx.restore();
                    }

                    // --- Fissured: orange crack lines ---
                    if (this.affix.id === 'fissured') {
                        ctx.save();
                        ctx.translate(this.x, this.y);
                        ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 1.2; ctx.shadowBlur = 4; ctx.shadowColor = '#fb923c';
                        ctx.beginPath(); ctx.moveTo(-r * 0.5, -r * 0.8); ctx.lineTo(0, 0); ctx.lineTo(r * 0.6, r * 0.7); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(r * 0.4, -r * 0.6); ctx.lineTo(0, 0); ctx.lineTo(-r * 0.7, r * 0.4); ctx.stroke();
                        ctx.restore();
                    }

                    // --- Glacial: frost ring + shimmer ---
                    if (this.affix.id === 'glacial') {
                        ctx.save();
                        ctx.shadowBlur = 12; ctx.shadowColor = '#7dd3fc';
                        ctx.strokeStyle = 'rgba(125,211,252,0.85)'; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 1.65 + Math.sin(t) * 1.5, 0, Math.PI * 2); ctx.stroke();
                        ctx.strokeStyle = 'rgba(186,230,253,0.35)'; ctx.lineWidth = 5;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 2.1, 0, Math.PI * 2); ctx.stroke();
                        // Small icy spikes
                        ctx.strokeStyle = 'rgba(186,230,253,0.7)'; ctx.lineWidth = 1;
                        for (let i = 0; i < 6; i++) {
                            const a = i * Math.PI / 3 + t * 0.3;
                            ctx.beginPath();
                            ctx.moveTo(this.x + Math.cos(a) * r * 1.65, this.y + Math.sin(a) * r * 1.65);
                            ctx.lineTo(this.x + Math.cos(a) * r * 2.2, this.y + Math.sin(a) * r * 2.2);
                            ctx.stroke();
                        }
                        ctx.restore();
                    }

                    // --- Shielded: blue translucent dome + inner shield bar ---
                    if (this.affix.id === 'shielded' && this.shield > 0) {
                        const shieldFrac = this.shield / this.maxShield;
                        ctx.save();
                        ctx.shadowBlur = 12; ctx.shadowColor = '#38bdf8';
                        ctx.strokeStyle = `rgba(56,189,248,${0.5 + shieldFrac * 0.5})`; ctx.lineWidth = 2.5;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 1.8, 0, Math.PI * 2); ctx.stroke();
                        ctx.fillStyle = `rgba(56,189,248,${shieldFrac * 0.15})`;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 1.8, 0, Math.PI * 2); ctx.fill();
                        ctx.restore();
                    }

                    // --- Jammer: cyan ripple wave ---
                    if (this.affix.id === 'jammer') {
                        const rippleProgress = 1 - (this.jammerCooldown / 480);
                        if (rippleProgress < 0.4) {
                            const alpha = 1 - rippleProgress / 0.4;
                            const rippleR = r * 1.5 + rippleProgress * r * 15;
                            ctx.save();
                            ctx.strokeStyle = `rgba(167,139,250,${alpha * 0.8})`; ctx.lineWidth = 2;
                            ctx.beginPath(); ctx.arc(this.x, this.y, rippleR, 0, Math.PI * 2); ctx.stroke();
                            ctx.restore();
                        }
                        // Antenna icon
                        ctx.save();
                        ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1.5; ctx.shadowBlur = 6; ctx.shadowColor = '#a78bfa';
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 2.2, -Math.PI * 0.4, Math.PI * 0.4); ctx.stroke();
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 2.8, -Math.PI * 0.3, Math.PI * 0.3); ctx.stroke();
                        ctx.restore();
                    }

                    // --- Berserk: red heat distortion glow ---
                    if (this.isBerserk && this.maxHp > 0) {
                        const frenzyFrac = Math.min(1, 1 - (this.hp / this.maxHp));
                        if (frenzyFrac > 0.1) {
                            ctx.save();
                            ctx.shadowBlur = 20 * frenzyFrac; ctx.shadowColor = '#f43f5e';
                            ctx.strokeStyle = `rgba(244,63,94,${frenzyFrac * 0.9})`; ctx.lineWidth = 2 + frenzyFrac * 3;
                            ctx.beginPath(); ctx.arc(this.x, this.y, r * (1.4 + frenzyFrac * 0.5) + Math.sin(t * 5) * 2, 0, Math.PI * 2); ctx.stroke();
                            ctx.restore();
                        }
                    }

                    // --- Commander: gold star aura ---
                    if (this.isCommander) {
                        const pulse = 0.6 + Math.sin(t * 1.5) * 0.4;
                        ctx.save();
                        ctx.shadowBlur = 18; ctx.shadowColor = '#fbbf24';
                        ctx.strokeStyle = `rgba(251,191,36,${pulse * 0.8})`; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 2.0, 0, Math.PI * 2); ctx.stroke();
                        ctx.strokeStyle = `rgba(251,191,36,${pulse * 0.25})`; ctx.lineWidth = 8;
                        ctx.beginPath(); ctx.arc(this.x, this.y, this.commandAuraRadius, 0, Math.PI * 2); ctx.stroke();
                        // 4-pointed star crown
                        ctx.strokeStyle = `rgba(253,230,138,${pulse})`; ctx.lineWidth = 1.5;
                        for (let i = 0; i < 4; i++) {
                            const a = i * Math.PI / 2 + t * 0.5;
                            ctx.beginPath();
                            ctx.moveTo(this.x + Math.cos(a) * r * 1.8, this.y + Math.sin(a) * r * 1.8);
                            ctx.lineTo(this.x + Math.cos(a) * r * 2.6, this.y + Math.sin(a) * r * 2.6);
                            ctx.stroke();
                        }
                        ctx.restore();
                    }

                    // --- Commander boosted: faint gold shimmer on boosted enemies ---
                    if (this._commanderBoosted) {
                        ctx.save();
                        ctx.strokeStyle = 'rgba(251,191,36,0.3)'; ctx.lineWidth = 1.5;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 1.3, 0, Math.PI * 2); ctx.stroke();
                        ctx.restore();
                    }

                    // --- Mirror: crystal facet ring ---
                    if (this.affix.id === 'mirror') {
                        ctx.save();
                        ctx.shadowBlur = 8; ctx.shadowColor = '#e2e8f0';
                        ctx.strokeStyle = 'rgba(226,232,240,0.9)'; ctx.lineWidth = 1.5;
                        const facets = 8;
                        for (let i = 0; i < facets; i++) {
                            const a1 = (i / facets) * Math.PI * 2 + t * 0.2;
                            const a2 = ((i + 0.5) / facets) * Math.PI * 2 + t * 0.2;
                            ctx.beginPath();
                            ctx.moveTo(this.x + Math.cos(a1) * r * 1.5, this.y + Math.sin(a1) * r * 1.5);
                            ctx.lineTo(this.x + Math.cos(a2) * r * 2.1, this.y + Math.sin(a2) * r * 2.1);
                            ctx.lineTo(this.x + Math.cos(a1 + Math.PI / facets) * r * 1.5, this.y + Math.sin(a1 + Math.PI / facets) * r * 1.5);
                            ctx.stroke();
                        }
                        ctx.restore();
                    }

                    // --- Gilded: gold outline + sparkle ---
                    if (this.isGilded) {
                        const shimmer = 0.6 + Math.sin(t * 2) * 0.4;
                        ctx.save();
                        ctx.shadowBlur = 18; ctx.shadowColor = '#fde68a';
                        ctx.strokeStyle = `rgba(253,230,138,${shimmer})`; ctx.lineWidth = 3;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 1.55, 0, Math.PI * 2); ctx.stroke();
                        ctx.strokeStyle = `rgba(251,191,36,${shimmer * 0.5})`; ctx.lineWidth = 6;
                        ctx.beginPath(); ctx.arc(this.x, this.y, r * 1.9, 0, Math.PI * 2); ctx.stroke();
                        // Gold sparkle dots
                        for (let i = 0; i < 5; i++) {
                            const a = i * Math.PI * 0.4 + t * 1.5;
                            const sparkR = r * 2.2;
                            ctx.fillStyle = `rgba(253,230,138,${0.6 + Math.sin(t * 2 + i) * 0.4})`;
                            ctx.beginPath();
                            ctx.arc(this.x + Math.cos(a) * sparkR, this.y + Math.sin(a) * sparkR, 2, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.restore();
                    }

                    // --- Affix label above HP bar ---
                    const labelY = this.y - r - 14;
                    ctx.save();
                    ctx.font = `bold ${Math.max(7, Math.round(8 * state.gameScale))}px Inter, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.fillStyle = this.affix.color;
                    ctx.shadowBlur = 4; ctx.shadowColor = this.affix.color;
                    ctx.fillText(this.affix.name.toUpperCase(), this.x, labelY);
                    ctx.restore();
                }
                // ======================================================

                // Shield bar for shielded enemies
                if (this.affix && this.affix.id === 'shielded' && this.maxShield > 0 && this.shield > 0) {
                    const barW = this.size * 2; const barH = 2.5;
                    const shieldBarY = this.y - this.size - 10;
                    state.ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'; state.ctx.fillRect(this.x - barW / 2, shieldBarY, barW, barH);
                    state.ctx.fillStyle = '#38bdf8'; state.ctx.fillRect(this.x - barW / 2, shieldBarY, barW * (this.shield / this.maxShield), barH);
                }

                if (this.hp < this.maxHp) {
                    const barW = this.size * 2; const barH = 2.5;
                    state.ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'; state.ctx.fillRect(this.x - barW / 2, this.y - this.size - 6, barW, barH);
                    state.ctx.fillStyle = '#10b981'; state.ctx.fillRect(this.x - barW / 2, this.y - this.size - 6, barW * (this.hp / this.maxHp), barH);
                }
            }
        }
