export class Overwatch {
    constructor(entityManager, hitCalculation, damageCalculation, eventBus) {
        this.em = entityManager;
        this.hitCalc = hitCalculation;
        this.damageCalc = damageCalculation;
        this.eventBus = eventBus;
    }

    setOverwatch(entityId) {
        const combat = this.em.get(entityId, 'CombatState');
        const stats = this.em.get(entityId, 'Stats');
        if (!combat || !stats) return false;

        combat.overwatching = true;
        combat.overwatchAP = stats.ap;
        stats.ap = 0;
        return true;
    }

    checkReactionFire(movingEntityId) {
        const movingPos = this.em.get(movingEntityId, 'Position');
        const movingFaction = this.em.get(movingEntityId, 'Faction');
        if (!movingPos || !movingFaction) return [];

        const reactions = [];
        const watchers = this.em.query('CombatState', 'Position', 'Stats', 'Faction');

        for (const wid of watchers) {
            if (wid === movingEntityId) continue;

            const combat = this.em.get(wid, 'CombatState');
            if (!combat.overwatching) continue;

            const watcherFaction = this.em.get(wid, 'Faction');
            if (watcherFaction.id === movingFaction.id) continue;

            const weapon = combat.equippedWeapon;
            if (!weapon) continue;

            const watcherPos = this.em.get(wid, 'Position');
            const watcherStats = this.em.get(wid, 'Stats');

            // Attempt reaction shot
            const hitResult = this.hitCalc.calculate(
                watcherStats, this.em.get(movingEntityId, 'Stats') || { ac: 0 },
                watcherPos, movingPos, weapon
            );

            const rolled = Math.random() * 100;
            const hit = rolled < hitResult.hitChance;

            let damageResult = null;
            if (hit) {
                damageResult = this.damageCalc.calculate(
                    watcherStats,
                    this.em.get(movingEntityId, 'Stats') || {},
                    weapon
                );
            }

            combat.overwatching = false;
            combat.overwatchAP = 0;

            reactions.push({
                shooterId: wid,
                targetId: movingEntityId,
                hit,
                hitChance: hitResult.hitChance,
                damage: damageResult,
            });

            this.eventBus.emit('overwatchFired', {
                shooterId: wid,
                targetId: movingEntityId,
                hit,
                damage: damageResult,
            });
        }

        return reactions;
    }
}
