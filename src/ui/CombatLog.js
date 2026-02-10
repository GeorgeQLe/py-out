import { Colors } from '../render/Colors.js';

export class CombatLog {
    constructor(eventBus) {
        this.messages = [];
        this.maxMessages = 50;
        this.displayCount = 5;
        this.visible = true;

        eventBus.on('combatLog', (data) => this.add(data.text, data.color));
        eventBus.on('shotFired', (data) => this._logShot(data));
        eventBus.on('entityDamaged', (data) => this._logDamage(data));
        eventBus.on('entityDied', (data) => this._logDeath(data));
        eventBus.on('overwatchFired', (data) => this._logOverwatch(data));
        eventBus.on('combatStarted', () => this.add('-- Combat started! --', Colors.uiHighlight));
        eventBus.on('combatEnded', () => this.add('-- Combat ended --', Colors.uiHighlight));
    }

    add(text, color = Colors.uiText) {
        this.messages.push({ text, color, time: Date.now() });
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
    }

    _logShot(data) {
        const { result } = data;
        const bodyStr = data.bodyPart ? ` (${data.bodyPart.name})` : '';
        if (result.hit) {
            const critStr = result.damage.isCrit ? ' CRITICAL!' : '';
            this.add(
                `Hit${bodyStr}! ${result.damage.damage} damage${critStr} (${result.hitChance}%)`,
                result.damage.isCrit ? '#ff6' : Colors.uiText
            );
        } else {
            this.add(`Missed${bodyStr}! (${result.hitChance}% chance, rolled ${Math.round(result.rolled)})`, '#888');
        }
    }

    _logDamage(data) {
        // Handled by _logShot for shots
    }

    _logDeath(data) {
        this.add('Target destroyed!', '#f66');
    }

    _logOverwatch(data) {
        if (data.hit) {
            this.add(`Overwatch fire! ${data.damage.damage} damage!`, '#fa0');
        } else {
            this.add('Overwatch fire! Missed!', '#888');
        }
    }

    render(renderer) {
        if (!this.visible) return;

        const startRow = 1;
        const recent = this.messages.slice(-this.displayCount);

        for (let i = 0; i < recent.length; i++) {
            const msg = recent[i];
            const age = Date.now() - msg.time;
            const alpha = age > 5000 ? 0.4 : 1;
            const color = alpha < 1 ? Colors.uiDim : msg.color;
            renderer.drawText(1, startRow + i, msg.text, color);
        }
    }
}
