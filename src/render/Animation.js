import { Colors } from './Colors.js';

export class AnimationManager {
    constructor() {
        this.animations = [];
    }

    addProjectile(fromX, fromY, toX, toY, hit) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));

        this.animations.push({
            type: 'projectile',
            frames: [],
            currentFrame: 0,
            frameDelay: 30,
            lastFrame: 0,
        });

        const anim = this.animations[this.animations.length - 1];
        for (let i = 0; i <= steps; i++) {
            const t = steps === 0 ? 1 : i / steps;
            anim.frames.push({
                x: Math.round(fromX + dx * t),
                y: Math.round(fromY + dy * t),
                glyph: hit ? '*' : '.',
                fg: hit ? '#ff6' : '#888',
            });
        }
    }

    addDamageNumber(x, y, damage, isCrit) {
        this.animations.push({
            type: 'damageNumber',
            x, y,
            text: isCrit ? `${damage}!!` : `${damage}`,
            fg: isCrit ? '#ff0' : '#f66',
            startTime: performance.now(),
            duration: 1000,
            offsetY: 0,
        });
    }

    addText(x, y, text, fg, duration = 800) {
        this.animations.push({
            type: 'text',
            x, y, text, fg,
            startTime: performance.now(),
            duration,
            offsetY: 0,
        });
    }

    update() {
        const now = performance.now();
        this.animations = this.animations.filter(anim => {
            if (anim.type === 'projectile') {
                if (now - anim.lastFrame > anim.frameDelay) {
                    anim.currentFrame++;
                    anim.lastFrame = now;
                }
                return anim.currentFrame < anim.frames.length;
            }
            if (anim.type === 'damageNumber' || anim.type === 'text') {
                const elapsed = now - anim.startTime;
                anim.offsetY = -Math.floor(elapsed / 200);
                return elapsed < anim.duration;
            }
            return false;
        });
    }

    render(renderer, camera) {
        for (const anim of this.animations) {
            if (anim.type === 'projectile') {
                const frame = anim.frames[anim.currentFrame];
                if (!frame) continue;
                if (!camera.isVisible(frame.x, frame.y)) continue;
                const sx = frame.x - camera.x;
                const sy = frame.y - camera.y;
                renderer.drawGlyph(sx, sy, frame.glyph, frame.fg);
            }
            if (anim.type === 'damageNumber' || anim.type === 'text') {
                if (!camera.isVisible(anim.x, anim.y)) continue;
                const sx = anim.x - camera.x;
                const sy = anim.y - camera.y + anim.offsetY;
                if (sy >= 0) {
                    renderer.drawText(sx, sy, anim.text || anim.text, anim.fg);
                }
            }
        }
    }

    isAnimating() {
        return this.animations.length > 0;
    }
}
