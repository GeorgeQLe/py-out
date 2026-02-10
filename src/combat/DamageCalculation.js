import { randomInt, rollPercent } from '../core/Utils.js';

export class DamageCalculation {
    calculate(attacker, target, weapon, bodyPart = null, flanking = false) {
        // Base damage roll
        let damage = randomInt(weapon.damageMin, weapon.damageMax);

        // Ammo modifier
        if (weapon.ammoModifier) {
            damage = Math.floor(damage * weapon.ammoModifier);
        }

        // Critical hit check
        let isCrit = false;
        let critRoll = attacker.critChance || attacker.luck;
        if (flanking) critRoll *= 1.5;
        if (bodyPart && bodyPart.critMultiplier > 2) critRoll += 10; // head/eyes bonus

        if (rollPercent() < critRoll) {
            isCrit = true;
            const multiplier = bodyPart ? bodyPart.critMultiplier : 2;
            damage = Math.floor(damage * multiplier);
        }

        // Apply armor: DT reduces flat, DR reduces percentage
        const armorDT = target._armorDT || 0;
        const armorDR = target._armorDR || 0;

        damage = Math.max(0, damage - armorDT);
        damage = Math.floor(damage * (1 - armorDR / 100));

        // Minimum 1 damage on hit
        damage = Math.max(1, damage);

        // Body part effect
        let effect = null;
        if (bodyPart && bodyPart.effect && (isCrit || rollPercent() < 30)) {
            effect = bodyPart.effect;
        }

        return { damage, isCrit, effect };
    }
}
