export class StatusEffectSystem {
    constructor(entityManager, eventBus) {
        this.em = entityManager;
        this.eventBus = eventBus;
    }

    processTurn(entityId) {
        const combat = this.em.get(entityId, 'CombatState');
        const stats = this.em.get(entityId, 'Stats');
        if (!combat || !stats) return;

        combat.statusEffects = combat.statusEffects.filter(effect => {
            this._tickEffect(entityId, stats, effect);
            effect.duration--;
            if (effect.duration <= 0) {
                this._removeEffect(entityId, stats, effect);
                return false;
            }
            return true;
        });
    }

    _tickEffect(entityId, stats, effect) {
        switch (effect.type) {
            case 'bleed':
                stats.hp -= effect.strength;
                this.eventBus.emit('combatLog', {
                    text: `Bleeding: ${effect.strength} damage`,
                    color: '#aa0000',
                });
                break;

            case 'poison':
                stats.hp -= effect.strength;
                stats.ap = Math.max(0, stats.ap - 1);
                this.eventBus.emit('combatLog', {
                    text: `Poisoned: ${effect.strength} damage, -1 AP`,
                    color: '#00aa00',
                });
                break;

            case 'stun':
                stats.ap = 0;
                break;

            case 'slow':
                stats.ap = Math.max(0, Math.floor(stats.maxAP / 2));
                break;

            case 'blind':
                // Handled by hit calculation (reduced perception)
                break;

            case 'brain_bitz':
                // Buff handled by checking for effect
                break;

            case 'buff_puff':
                // Buff handled by checking for effect
                break;
        }

        if (stats.hp <= 0) {
            this.eventBus.emit('entityDied', { entityId });
        }
    }

    _removeEffect(entityId, stats, effect) {
        this.eventBus.emit('combatLog', {
            text: `${effect.type} wore off.`,
            color: '#888888',
        });
    }

    hasEffect(entityId, effectType) {
        const combat = this.em.get(entityId, 'CombatState');
        if (!combat) return false;
        return combat.statusEffects.some(e => e.type === effectType);
    }
}
