export class TurnManager {
    constructor(entityManager, eventBus) {
        this.em = entityManager;
        this.eventBus = eventBus;
        this.turnOrder = [];
        this.currentIndex = 0;
        this.roundNumber = 0;
        this.active = false;
    }

    startCombat(participants) {
        this.active = true;
        this.roundNumber = 1;

        // Roll initiative: agility + random
        this.turnOrder = participants.map(id => {
            const stats = this.em.get(id, 'Stats');
            const initiative = (stats ? stats.agility : 5) + Math.random() * 10;
            return { id, initiative };
        });

        this.turnOrder.sort((a, b) => b.initiative - a.initiative);
        this.currentIndex = 0;

        // Refresh AP for all
        for (const entry of this.turnOrder) {
            const stats = this.em.get(entry.id, 'Stats');
            const combat = this.em.get(entry.id, 'CombatState');
            if (stats) stats.ap = stats.maxAP;
            if (combat) combat.inCombat = true;
        }

        this.eventBus.emit('combatStarted', { round: this.roundNumber });
        this.eventBus.emit('turnStarted', { entityId: this.getCurrentEntity() });
    }

    getCurrentEntity() {
        if (this.turnOrder.length === 0) return null;
        return this.turnOrder[this.currentIndex].id;
    }

    nextTurn() {
        this.currentIndex++;

        // Remove dead entities
        this.turnOrder = this.turnOrder.filter(entry => {
            const stats = this.em.get(entry.id, 'Stats');
            return stats && stats.hp > 0;
        });

        if (this.turnOrder.length === 0) {
            this.endCombat();
            return;
        }

        if (this.currentIndex >= this.turnOrder.length) {
            this.currentIndex = 0;
            this.roundNumber++;

            // Refresh AP each round
            for (const entry of this.turnOrder) {
                const stats = this.em.get(entry.id, 'Stats');
                if (stats) stats.ap = stats.maxAP;
                const combat = this.em.get(entry.id, 'CombatState');
                if (combat) combat.overwatching = false;
            }

            this.eventBus.emit('newRound', { round: this.roundNumber });
        }

        this.eventBus.emit('turnStarted', { entityId: this.getCurrentEntity() });
    }

    endCombat() {
        this.active = false;
        for (const entry of this.turnOrder) {
            const combat = this.em.get(entry.id, 'CombatState');
            if (combat) {
                combat.inCombat = false;
                combat.overwatching = false;
                combat.statusEffects = [];
            }
        }
        this.turnOrder = [];
        this.eventBus.emit('combatEnded', {});
    }

    removeEntity(entityId) {
        const idx = this.turnOrder.findIndex(e => e.id === entityId);
        if (idx !== -1) {
            this.turnOrder.splice(idx, 1);
            if (idx < this.currentIndex) this.currentIndex--;
            if (this.currentIndex >= this.turnOrder.length) this.currentIndex = 0;
        }
    }

    isPlayerTurn() {
        const current = this.getCurrentEntity();
        return current && this.em.has(current, 'Player');
    }
}
