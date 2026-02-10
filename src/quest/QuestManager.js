export const QuestState = {
    UNKNOWN: 'UNKNOWN',
    AVAILABLE: 'AVAILABLE',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
};

export class QuestManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.quests = new Map(); // questId -> { definition, state, objectives }
        this.questDefinitions = new Map();
    }

    registerQuest(definition) {
        this.questDefinitions.set(definition.id, definition);
        this.quests.set(definition.id, {
            definition,
            state: QuestState.UNKNOWN,
            objectives: definition.objectives.map(obj => ({
                ...obj,
                current: 0,
                completed: false,
            })),
        });
    }

    getQuestState(questId) {
        const quest = this.quests.get(questId);
        return quest ? quest.state : QuestState.UNKNOWN;
    }

    makeAvailable(questId) {
        const quest = this.quests.get(questId);
        if (quest && quest.state === QuestState.UNKNOWN) {
            quest.state = QuestState.AVAILABLE;
            this.eventBus.emit('questAvailable', { questId });
        }
    }

    startQuest(questId) {
        const quest = this.quests.get(questId);
        if (!quest) return;
        if (quest.state === QuestState.UNKNOWN || quest.state === QuestState.AVAILABLE) {
            quest.state = QuestState.ACTIVE;
            this.eventBus.emit('questStarted', { questId, name: quest.definition.name });
            this.eventBus.emit('combatLog', { text: `Quest started: ${quest.definition.name}`, color: '#ffcc00' });
        }
    }

    updateObjective(questId, objectiveIndex, amount = 1) {
        const quest = this.quests.get(questId);
        if (!quest || quest.state !== QuestState.ACTIVE) return;

        const obj = quest.objectives[objectiveIndex];
        if (!obj || obj.completed) return;

        obj.current = Math.min(obj.current + amount, obj.target);
        if (obj.current >= obj.target) {
            obj.completed = true;
            this.eventBus.emit('objectiveCompleted', { questId, objectiveIndex });
        }

        // Check if all objectives complete
        if (quest.objectives.every(o => o.completed)) {
            this.completeQuest(questId);
        }
    }

    completeQuest(questId) {
        const quest = this.quests.get(questId);
        if (!quest || quest.state !== QuestState.ACTIVE) return;

        quest.state = QuestState.COMPLETED;
        this.eventBus.emit('questCompleted', { questId, name: quest.definition.name });
        this.eventBus.emit('combatLog', { text: `Quest completed: ${quest.definition.name}`, color: '#44ff44' });

        // Award XP
        if (quest.definition.xpReward) {
            this.eventBus.emit('addXP', { amount: quest.definition.xpReward });
        }
    }

    failQuest(questId) {
        const quest = this.quests.get(questId);
        if (!quest || quest.state !== QuestState.ACTIVE) return;

        quest.state = QuestState.FAILED;
        this.eventBus.emit('questFailed', { questId, name: quest.definition.name });
    }

    getActiveQuests() {
        const active = [];
        for (const [id, quest] of this.quests) {
            if (quest.state === QuestState.ACTIVE) active.push(quest);
        }
        return active;
    }

    getCompletedQuests() {
        const completed = [];
        for (const [id, quest] of this.quests) {
            if (quest.state === QuestState.COMPLETED) completed.push(quest);
        }
        return completed;
    }

    getAllQuests() {
        return [...this.quests.values()].filter(q => q.state !== QuestState.UNKNOWN);
    }
}
