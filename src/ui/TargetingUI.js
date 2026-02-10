import { Colors } from '../render/Colors.js';
import { BodyParts, BodyPartKeys } from '../combat/TargetedShot.js';

export class TargetingUI {
    constructor(entityManager, hitCalculation, eventBus) {
        this.em = entityManager;
        this.hitCalc = hitCalculation;
        this.eventBus = eventBus;
        this.visible = false;
        this.targetId = null;
        this.selectedPart = 0;  // index into BodyPartKeys
        this.attackerId = null;
    }

    open(attackerId, targetId) {
        this.attackerId = attackerId;
        this.targetId = targetId;
        this.selectedPart = 1; // default to torso
        this.visible = true;
    }

    close() {
        this.visible = false;
        this.targetId = null;
    }

    handleInput(key) {
        if (!this.visible) return false;

        switch (key) {
            case 'ArrowUp': case 'k':
                this.selectedPart = (this.selectedPart - 1 + BodyPartKeys.length) % BodyPartKeys.length;
                return true;
            case 'ArrowDown': case 'j':
                this.selectedPart = (this.selectedPart + 1) % BodyPartKeys.length;
                return true;
            case 'Enter': case 'f':
                this.eventBus.emit('aimedShotConfirmed', {
                    attackerId: this.attackerId,
                    targetId: this.targetId,
                    bodyPart: BodyParts[BodyPartKeys[this.selectedPart]],
                });
                this.close();
                return true;
            case 'Escape': case 'q':
                this.close();
                return true;
        }
        return false;
    }

    render(renderer) {
        if (!this.visible) return;

        const boxW = 32;
        const boxH = BodyPartKeys.length + 4;
        const boxX = Math.floor((renderer.cols - boxW) / 2);
        const boxY = Math.floor((renderer.rows - boxH) / 2);

        renderer.drawBox(boxX, boxY, boxW, boxH, Colors.uiBorder, Colors.uiBg);
        renderer.drawText(boxX + 2, boxY + 1, 'AIMED SHOT - Select Target', Colors.uiHighlight, Colors.uiBg);

        const attackerStats = this.em.get(this.attackerId, 'Stats');
        const targetStats = this.em.get(this.targetId, 'Stats');
        const attackerPos = this.em.get(this.attackerId, 'Position');
        const targetPos = this.em.get(this.targetId, 'Position');
        const combat = this.em.get(this.attackerId, 'CombatState');
        const weapon = combat ? combat.equippedWeapon : null;

        for (let i = 0; i < BodyPartKeys.length; i++) {
            const key = BodyPartKeys[i];
            const part = BodyParts[key];
            const selected = i === this.selectedPart;
            const prefix = selected ? '> ' : '  ';
            const fg = selected ? Colors.uiHighlight : Colors.uiText;

            let hitStr = '??%';
            if (weapon && attackerStats && targetStats && attackerPos && targetPos) {
                const result = this.hitCalc.calculate(
                    attackerStats, targetStats, attackerPos, targetPos, weapon, part
                );
                hitStr = `${Math.round(result.hitChance)}%`;
            }

            const text = `${prefix}${part.name.padEnd(8)} Hit:${hitStr.padStart(4)} Crit:x${part.critMultiplier}`;
            renderer.drawText(boxX + 2, boxY + 3 + i, text, fg, Colors.uiBg);
        }
    }
}
