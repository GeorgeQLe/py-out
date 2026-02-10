import { Colors } from '../render/Colors.js';
import { specialNames, specialDisplayNames, skillNames, skillDisplayNames } from '../data/tables.js';
import { DerivedStats } from '../rpg/DerivedStats.js';

export class CharacterSheet {
    constructor(entityManager, playerId) {
        this.em = entityManager;
        this.playerId = playerId;
        this.visible = false;
    }

    toggle() {
        this.visible = !this.visible;
    }

    handleInput(key) {
        if (!this.visible) return false;
        if (key === 'c' || key === 'Escape') {
            this.visible = false;
            return true;
        }
        return true; // consume all input while open
    }

    render(renderer) {
        if (!this.visible) return;

        const stats = this.em.get(this.playerId, 'Stats');
        if (!stats) return;

        const w = 60;
        const h = 28;
        const x = Math.floor((renderer.cols - w) / 2);
        const y = Math.floor((renderer.rows - h) / 2);

        renderer.drawBox(x, y, w, h, Colors.uiBorder, Colors.uiBg);
        renderer.drawText(x + 2, y + 1, 'CHARACTER SHEET', Colors.uiHighlight, Colors.uiBg);

        // Level & XP
        const nextXP = DerivedStats.getXPForLevel(stats.level + 1);
        renderer.drawText(x + 2, y + 3, `Level: ${stats.level}  XP: ${stats.xp}/${nextXP}`, Colors.uiText, Colors.uiBg);
        renderer.drawText(x + 2, y + 4, `HP: ${stats.hp}/${stats.maxHP}  AP: ${stats.ap}/${stats.maxAP}  AC: ${stats.ac}`, Colors.uiText, Colors.uiBg);

        // S.P.E.C.I.A.L.
        renderer.drawText(x + 2, y + 6, 'S.P.E.C.I.A.L.', Colors.uiHighlight, Colors.uiBg);
        for (let i = 0; i < specialNames.length; i++) {
            const name = specialDisplayNames[specialNames[i]];
            const value = stats[specialNames[i]];
            renderer.drawText(x + 2, y + 7 + i, `${name.padEnd(14)} ${value}`, Colors.uiText, Colors.uiBg);
        }

        // Skills
        renderer.drawText(x + 28, y + 6, 'SKILLS', Colors.uiHighlight, Colors.uiBg);
        for (let i = 0; i < skillNames.length; i++) {
            const name = skillDisplayNames[skillNames[i]];
            const value = stats.skills[skillNames[i]] || 0;
            const fg = value >= 50 ? Colors.uiText : Colors.uiDim;
            renderer.drawText(x + 28, y + 7 + i, `${name.padEnd(16)} ${String(value).padStart(3)}%`, fg, Colors.uiBg);
        }

        renderer.drawText(x + 2, y + h - 2, '[c/Esc] Close', Colors.uiDim, Colors.uiBg);
    }
}
