export class QuestTriggers {
    constructor(questManager, eventBus, entityManager) {
        this.qm = questManager;
        this.eventBus = eventBus;
        this.em = entityManager;
        this._bind();
    }

    _bind() {
        this.eventBus.on('entityDied', (data) => {
            this._checkKillObjectives(data.entityId);
        });

        this.eventBus.on('itemPickedUp', (data) => {
            this._checkFetchObjectives(data.item);
        });

        this.eventBus.on('entityMoved', (data) => {
            this._checkLocationObjectives(data);
        });

        this.eventBus.on('dialogueEnded', (data) => {
            this._checkTalkObjectives(data);
        });
    }

    _checkKillObjectives(entityId) {
        const faction = this.em && this.em.get(entityId, 'Faction');
        for (const quest of this.qm.getActiveQuests()) {
            quest.objectives.forEach((obj, i) => {
                if (obj.type === 'kill' && !obj.completed) {
                    if (obj.targetFaction === 'any' ||
                        (faction && obj.targetFaction === faction.id)) {
                        this.qm.updateObjective(quest.definition.id, i);
                    }
                }
            });
        }
    }

    _checkFetchObjectives(item) {
        for (const quest of this.qm.getActiveQuests()) {
            quest.objectives.forEach((obj, i) => {
                if (obj.type === 'fetchItem' && !obj.completed && obj.itemId === item.id) {
                    this.qm.updateObjective(quest.definition.id, i);
                }
            });
        }
    }

    _checkLocationObjectives(data) {
        for (const quest of this.qm.getActiveQuests()) {
            quest.objectives.forEach((obj, i) => {
                if (obj.type === 'reachLocation' && !obj.completed) {
                    if (data.x === obj.targetX && data.y === obj.targetY) {
                        this.qm.updateObjective(quest.definition.id, i);
                    }
                }
            });
        }
    }

    _checkTalkObjectives(data) {
        for (const quest of this.qm.getActiveQuests()) {
            quest.objectives.forEach((obj, i) => {
                if (obj.type === 'talkTo' && !obj.completed) {
                    if (data.npcId === obj.targetNpcId) {
                        this.qm.updateObjective(quest.definition.id, i);
                    }
                }
            });
        }
    }
}
