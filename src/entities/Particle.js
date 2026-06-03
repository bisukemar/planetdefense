import { state } from '../state.js';
import * as config from '../config.js';

export class Particle {
            constructor(x, y, color) {
                this.x = x; this.y = y; this.color = color;
                const angle = Math.random() * Math.PI * 2; const force = Math.random() * 3 + 1;
                this.dx = Math.cos(angle) * force; this.dy = Math.sin(angle) * force;
                this.alpha = 1.0; this.decay = Math.random() * 0.04 + 0.02; this.size = (Math.random() * 2.5 + 1) * state.gameScale;
            }
            update(speedMultiplier = 1) { this.x += this.dx * speedMultiplier; this.y += this.dy * speedMultiplier; this.alpha -= this.decay * speedMultiplier; }
            draw() {
                state.ctx.save(); state.ctx.globalAlpha = this.alpha; state.ctx.fillStyle = this.color;
                state.ctx.beginPath(); state.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); state.ctx.fill(); state.ctx.restore();
            }
        }
