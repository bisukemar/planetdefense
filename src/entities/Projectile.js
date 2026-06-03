import { state } from '../state.js';
import * as config from '../config.js';
import { getTargetedDamageMultiplier } from '../main.js';

export class Projectile {
            constructor(startX, startY, target, type, damage, speed, range) {
                this.x = startX; this.y = startY; this.target = target; this.type = type; this.damage = damage; this.speed = speed;
                this.range = range;
                const angle = Math.atan2(target.y - startY, target.x - startX);
                this.dx = Math.cos(angle) * speed; this.dy = Math.sin(angle) * speed;
                this.dead = false; this.trail = [];
            }
            update(speedMultiplier = 1) {
                this.trail.push({ x: this.x, y: this.y });
                if (this.trail.length > 6) this.trail.shift();

                if ((this.type === 'missile' || this.type === 'magnetsentry' || this.type === 'plasma') && state.game.enemies.includes(this.target)) {
                    const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                    this.dx = Math.cos(angle) * this.speed; this.dy = Math.sin(angle) * this.speed;
                }

                this.x += this.dx * speedMultiplier; this.y += this.dy * speedMultiplier;

                if (state.game.enemies.includes(this.target)) {
                    const distToTarget = Math.hypot(this.target.x - this.x, this.target.y - this.y);
                    if (distToTarget < this.target.size + 4) {
                        this.impact(this.target);
                    }
                } else {
                    if (Math.abs(this.x) > state.canvas.width || Math.abs(this.y) > state.canvas.height) this.dead = true;
                }
            }
            impact(enemy) {
                this.dead = true;
                if (this.type === 'plasma') {
                    state.playSynthSound('explosion'); state.createExplosion(this.x, this.y, '#10b981', 25);
                    const blastRadius = 60 * state.rangeScale;
                    for (let e of state.game.enemies) {
                        const distance = Math.hypot(e.x - this.x, e.y - this.y);
                        if (distance < blastRadius) e.hp -= Math.floor(this.damage * getTargetedDamageMultiplier(e, this.type));
                    }
                } else if (this.type === 'railgun') {
                    state.playSynthSound('hit'); state.createExplosion(this.x, this.y, '#a855f7', 15);
                    enemy.hp -= Math.floor(this.damage * getTargetedDamageMultiplier(enemy, this.type)); enemy.speed *= 0.5;
                } else if (this.type === 'magnetsentry') {
                    state.playSynthSound('hit');
                    state.createExplosion(this.x, this.y, '#3b82f6', 10);
                    enemy.hp -= Math.floor(this.damage * getTargetedDamageMultiplier(enemy, this.type));
                    enemy.slowMultiplier = Math.min(enemy.slowMultiplier, 0.4);
                    enemy.slowTimer = Math.max(enemy.slowTimer, 240);
                } else {
                    state.playSynthSound('hit');
                    state.createExplosion(this.x, this.y, this.type === 'missile' ? '#ef4444' : '#38bdf8', 10);
                    enemy.hp -= Math.floor(this.damage * getTargetedDamageMultiplier(enemy, this.type));
                    if (this.type === 'missile') {
                        const clusters = state.getDirectiveEffectValue('missileBlast', 0);
                        const missileTradeoff = state.getDirectiveEffectValue('missileTradeoff');
                        const blastRadius = 38 * state.rangeScale * (1 + (missileTradeoff ? missileTradeoff.blast : 0));
                        if (clusters || missileTradeoff) {
                            for (let e of state.game.enemies) {
                                if (e.id === enemy.id) continue;
                                const distance = Math.hypot(e.x - this.x, e.y - this.y);
                                if (distance < blastRadius) e.hp -= Math.floor(this.damage * (0.18 + clusters * 0.04) * getTargetedDamageMultiplier(e, this.type));
                            }
                        }
                    }
                }
            }
            draw() {
                state.ctx.save(); state.ctx.lineWidth = 2;
                if (this.trail.length > 1) {
                    state.ctx.beginPath(); state.ctx.moveTo(this.trail[0].x, this.trail[0].y);
                    for (let point of this.trail) state.ctx.lineTo(point.x, point.y);
                    state.ctx.strokeStyle = this.type === 'laser' ? 'rgba(56, 189, 248, 0.2)' :
                        this.type === 'plasma' ? 'rgba(16, 185, 129, 0.2)' :
                            this.type === 'missile' ? 'rgba(239, 68, 68, 0.2)' :
                                this.type === 'magnetsentry' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)';
                    state.ctx.stroke();
                }
                state.ctx.shadowBlur = 6;
                if (this.type === 'laser') { state.ctx.fillStyle = '#38bdf8'; state.ctx.shadowColor = '#38bdf8'; state.ctx.beginPath(); state.ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); state.ctx.fill(); }
                else if (this.type === 'plasma') { state.ctx.fillStyle = '#10b981'; state.ctx.shadowColor = '#10b981'; state.ctx.beginPath(); state.ctx.arc(this.x, this.y, 5, 0, Math.PI * 2); state.ctx.fill(); }
                else if (this.type === 'missile') { state.ctx.fillStyle = '#ef4444'; state.ctx.shadowColor = '#ef4444'; state.ctx.beginPath(); state.ctx.arc(this.x, this.y, 4, 0, Math.PI * 2); state.ctx.fill(); }
                else if (this.type === 'railgun') { state.ctx.fillStyle = '#a855f7'; state.ctx.shadowColor = '#a855f7'; state.ctx.beginPath(); state.ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2); state.ctx.fill(); }
                else if (this.type === 'magnetsentry') { state.ctx.fillStyle = '#3b82f6'; state.ctx.shadowColor = '#3b82f6'; state.ctx.beginPath(); state.ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2); state.ctx.fill(); }
                state.ctx.restore();
            }
        }
