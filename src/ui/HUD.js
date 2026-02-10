import { Colors } from '../render/Colors.js';

export class HUD {
    constructor(entityManager, playerId) {
        this.em = entityManager;
        this.playerId = playerId;
        this.visible = true;
    }

    render(renderer) {
        const stats = this.em.get(this.playerId, 'Stats');
        const combat = this.em.get(this.playerId, 'CombatState');
        if (!stats) return;

        const row = renderer.rows - 3;
        const cols = renderer.cols;

        // Background bar
        for (let x = 0; x < cols; x++) {
            renderer.drawGlyph(x, row, ' ', Colors.uiText, '#111111');
            renderer.drawGlyph(x, row + 1, ' ', Colors.uiText, '#0d0d0d');
            renderer.drawGlyph(x, row + 2, ' ', Colors.uiText, '#0a0a0a');
        }

        // HP bar
        const hpRatio = stats.hp / stats.maxHP;
        const hpColor = hpRatio > 0.6 ? Colors.uiText : hpRatio > 0.3 ? '#ffaa00' : '#ff3333';
        renderer.drawText(1, row, `HP: ${stats.hp}/${stats.maxHP}`, hpColor, '#111111');

        // HP visual bar
        const barWidth = 20;
        const filled = Math.round(barWidth * hpRatio);
        for (let i = 0; i < barWidth; i++) {
            const ch = i < filled ? '=' : '-';
            const color = i < filled ? hpColor : '#333333';
            renderer.drawGlyph(15 + i, row, ch, color, '#111111');
        }

        // AP
        const apStr = `AP: ${stats.ap}/${stats.maxAP}`;
        renderer.drawText(38, row, apStr, '#6af', '#111111');

        // AP pips
        for (let i = 0; i < stats.maxAP; i++) {
            const ch = i < stats.ap ? '*' : '.';
            const color = i < stats.ap ? '#6af' : '#333';
            renderer.drawGlyph(50 + i, row, ch, color, '#111111');
        }

        // Weapon info
        if (combat && combat.equippedWeapon) {
            const w = combat.equippedWeapon;
            renderer.drawText(1, row + 1, `Weapon: ${w.name}`, Colors.uiDim, '#0d0d0d');
            renderer.drawText(30, row + 1, `DMG: ${w.damageMin}-${w.damageMax}`, Colors.uiDim, '#0d0d0d');
            renderer.drawText(45, row + 1, `RNG: ${w.range}`, Colors.uiDim, '#0d0d0d');
        } else {
            renderer.drawText(1, row + 1, 'Weapon: None (Fists)', Colors.uiDim, '#0d0d0d');
        }

        // Controls hint
        if (combat && combat.inCombat) {
            renderer.drawText(1, row + 2, '[f]ire [a]imed [m]elee [o]verwatch [Space]end turn', Colors.uiDim, '#0a0a0a');
        } else {
            renderer.drawText(1, row + 2, '[hjkl/arrows]move [g]et [i]nventory [c]haracter', Colors.uiDim, '#0a0a0a');
        }
    }
}
