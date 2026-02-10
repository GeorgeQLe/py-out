export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, config = {}) {
        const {
            glyphs = ['*', '.', ',', '`'],
            fg = '#ff6600',
            speed = 0.5,
            life = 500,
            spread = 1,
        } = config;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * spread * 2,
                vy: (Math.random() - 0.5) * spread * 2,
                glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
                fg,
                life,
                maxLife: life,
                born: performance.now(),
                lastUpdate: performance.now(),
            });
        }
    }

    emitExplosion(x, y) {
        this.emit(x, y, 8, {
            glyphs: ['*', '#', '+', 'x'],
            fg: '#ff4400',
            speed: 1,
            life: 600,
            spread: 1.5,
        });
    }

    emitBlood(x, y) {
        this.emit(x, y, 4, {
            glyphs: ['.', ',', '`'],
            fg: '#aa0000',
            life: 800,
            spread: 0.5,
        });
    }

    emitSpark(x, y) {
        this.emit(x, y, 3, {
            glyphs: ['*', '.'],
            fg: '#ffff00',
            life: 300,
            spread: 0.8,
        });
    }

    update() {
        const now = performance.now();
        this.particles = this.particles.filter(p => {
            const age = now - p.born;
            if (age >= p.maxLife) return false;
            const dt = (now - p.lastUpdate) / 1000;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.lastUpdate = now;
            return true;
        });
    }

    render(renderer, camera) {
        const now = performance.now();
        for (const p of this.particles) {
            const age = now - p.born;
            const alpha = 1 - age / p.maxLife;
            if (alpha <= 0) continue;

            const sx = Math.round(p.x) - camera.x;
            const sy = Math.round(p.y) - camera.y;

            if (sx >= 0 && sx < renderer.cols && sy >= 0 && sy < renderer.rows) {
                // Fade color by reducing brightness
                renderer.drawGlyph(sx, sy, p.glyph, p.fg);
            }
        }
    }

    isActive() {
        return this.particles.length > 0;
    }
}
