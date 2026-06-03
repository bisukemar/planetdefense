import { state } from '../state.js';
import * as config from '../config.js';

export class Enemy {
            constructor(wave, profileIndex, theme, isEscort = false, escortIndex = 0, escortTotal = 1) {
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

                if (this.hp < this.maxHp) {
                    const barW = this.size * 2; const barH = 2.5;
                    state.ctx.fillStyle = 'rgba(15, 23, 42, 0.7)'; state.ctx.fillRect(this.x - barW / 2, this.y - this.size - 6, barW, barH);
                    state.ctx.fillStyle = '#10b981'; state.ctx.fillRect(this.x - barW / 2, this.y - this.size - 6, barW * (this.hp / this.maxHp), barH);
                }
            }
        }
