export class DialogueConditions {
    constructor(entityManager, questManager, game) {
        this.em = entityManager;
        this.questManager = questManager;
        this.game = game;
    }

    check(condition, playerId) {
        const stats = this.em.get(playerId, 'Stats');
        const inv = this.em.get(playerId, 'Inventory');

        switch (condition.type) {
            case 'skillCheck':
                return (stats.skills[condition.skill] || 0) >= condition.value;

            case 'statAbove':
                return (stats[condition.stat] || 0) >= condition.value;

            case 'statBelow':
                return (stats[condition.stat] || 0) < condition.value;

            case 'hasItem':
                if (!inv) return false;
                return inv.items.some(item => item.id === condition.itemId);

            case 'questState':
                if (!this.questManager) return false;
                return this.questManager.getQuestState(condition.questId) === condition.state;

            case 'questActive':
                if (!this.questManager) return false;
                return this.questManager.getQuestState(condition.questId) === 'ACTIVE';

            case 'questComplete':
                if (!this.questManager) return false;
                return this.questManager.getQuestState(condition.questId) === 'COMPLETED';

            case 'flag':
                return this._getFlag(condition.flag) === (condition.value !== undefined ? condition.value : true);

            default:
                return true;
        }
    }

    _getFlag(flag) {
        return this.game?.flags?.get(flag) ?? false;
    }

    getConditionLabel(condition) {
        switch (condition.type) {
            case 'skillCheck':
                return `[${condition.skill} ${condition.value}]`;
            case 'statAbove':
                return `[${condition.stat} ${condition.value}+]`;
            default:
                return '';
        }
    }
}
