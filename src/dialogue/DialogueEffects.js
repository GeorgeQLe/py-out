export class DialogueEffects {
    constructor(entityManager, eventBus, questManager) {
        this.em = entityManager;
        this.eventBus = eventBus;
        this.questManager = questManager;
    }

    apply(effect, playerId, npcId) {
        switch (effect.type) {
            case 'giveItem': {
                const inv = this.em.get(playerId, 'Inventory');
                if (inv) {
                    inv.items.push({ ...effect.item });
                    this.eventBus.emit('combatLog', { text: `Received: ${effect.item.name}` });
                }
                break;
            }

            case 'removeItem': {
                const inv = this.em.get(playerId, 'Inventory');
                if (inv) {
                    const idx = inv.items.findIndex(i => i.id === effect.itemId);
                    if (idx !== -1) inv.items.splice(idx, 1);
                }
                break;
            }

            case 'addXP': {
                this.eventBus.emit('addXP', { entityId: playerId, amount: effect.amount });
                break;
            }

            case 'startQuest': {
                if (this.questManager) {
                    this.questManager.startQuest(effect.questId);
                }
                break;
            }

            case 'completeQuest': {
                if (this.questManager) {
                    this.questManager.completeQuest(effect.questId);
                }
                break;
            }

            case 'modReputation': {
                this.eventBus.emit('reputationChanged', {
                    faction: effect.faction,
                    amount: effect.amount,
                });
                break;
            }

            case 'heal': {
                const stats = this.em.get(playerId, 'Stats');
                if (stats) {
                    stats.hp = Math.min(stats.maxHP, stats.hp + effect.amount);
                }
                break;
            }

            case 'setFlag': {
                this.eventBus.emit('setFlag', { flag: effect.flag, value: effect.value });
                break;
            }

            case 'openBarter': {
                this.eventBus.emit('openBarter', { npcId });
                break;
            }
        }
    }
}
