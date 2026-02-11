export class QuestTriggers {
    constructor(questManager, eventBus, entityManager, game) {
        this.qm = questManager;
        this.eventBus = eventBus;
        this.em = entityManager;
        this.game = game;
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

        this.eventBus.on('skillUsed', (data) => {
            this._checkSkillUseObjectives(data);
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
                    if (obj.mapId && this.game.currentMapId !== obj.mapId) return;
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

    _checkSkillUseObjectives(data) {
        for (const quest of this.qm.getActiveQuests()) {
            quest.objectives.forEach((obj, i) => {
                if (obj.type === 'skillUse' && !obj.completed) {
                    if (obj.skill === data.skill && data.skillLevel >= obj.difficulty) {
                        this.qm.updateObjective(quest.definition.id, i);
                    }
                }
            });
        }
    }
}
