import { TileMap } from '../map/TileMap.js';

export class SaveLoad {
    constructor(game) {
        this.game = game;
        this.prefix = 'wasteland_protocol_';
    }

    save(slot = 'auto') {
        // Serialize map snapshots (other maps' state)
        const serializedSnapshots = {};
        for (const [mapId, snapshot] of Object.entries(this.game.mapSnapshots)) {
            serializedSnapshots[mapId] = {
                tileMap: {
                    width: snapshot.tileMap.width,
                    height: snapshot.tileMap.height,
                    tiles: Array.from(snapshot.tileMap.tiles),
                    explored: Array.from(snapshot.tileMap.explored),
                },
                entities: snapshot.entities,
                nextEntityId: snapshot.nextEntityId,
            };
        }

        const data = {
            version: 2,
            timestamp: Date.now(),
            state: this.game.state,
            currentMapId: this.game.currentMapId,
            player: this._serializeEntity(this.game.playerId),
            tileMap: {
                width: this.game.tileMap.width,
                height: this.game.tileMap.height,
                tiles: Array.from(this.game.tileMap.tiles),
                explored: Array.from(this.game.tileMap.explored),
            },
            entities: this._serializeEntities(),
            nextEntityId: this.game.em.nextId,
            flags: Object.fromEntries(this.game.flags),
            quests: this._serializeQuests(),
            mapSnapshots: serializedSnapshots,
        };

        try {
            localStorage.setItem(this.prefix + slot, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }

    load(slot = 'auto') {
        try {
            const raw = localStorage.getItem(this.prefix + slot);
            if (!raw) return false;

            const data = JSON.parse(raw);

            // Migration: v1 saves treated as wasteland_outpost
            if (data.version === 1) {
                data.version = 2;
                data.currentMapId = 'wasteland_outpost';
                data.mapSnapshots = {};
            }

            if (data.version !== 2) return false;

            // Restore current map id
            this.game.currentMapId = data.currentMapId || 'wasteland_outpost';

            // Restore tilemap
            this.game.tileMap.width = data.tileMap.width;
            this.game.tileMap.height = data.tileMap.height;
            this.game.tileMap.tiles = data.tileMap.tiles;
            this.game.tileMap.explored = new Uint8Array(data.tileMap.explored);
            this.game.tileMap.visible = new Uint8Array(data.tileMap.width * data.tileMap.height);

            // Clear and restore entities
            for (const id of [...this.game.em.entities]) {
                this.game.em.destroy(id);
            }
            this.game.em.nextId = data.nextEntityId;

            for (const ent of data.entities) {
                this.game.em.entities.add(ent.id);
                for (const [compName, compData] of Object.entries(ent.components)) {
                    this.game.em.add(ent.id, compName, compData);
                }
            }

            // Restore player reference
            this.game.playerId = data.player.id;
            this.game.state = data.state;

            // Restore map snapshots
            this.game.mapSnapshots = {};
            if (data.mapSnapshots) {
                for (const [mapId, snap] of Object.entries(data.mapSnapshots)) {
                    const tm = new TileMap(snap.tileMap.width, snap.tileMap.height);
                    tm.tiles = snap.tileMap.tiles;
                    tm.explored = new Uint8Array(snap.tileMap.explored);
                    this.game.mapSnapshots[mapId] = {
                        tileMap: tm,
                        entities: snap.entities,
                        nextEntityId: snap.nextEntityId,
                    };
                }
            }

            // Restore flags
            this.game.flags = new Map(Object.entries(data.flags || {}));

            // Restore quest state
            if (data.quests) {
                for (const [questId, savedQuest] of Object.entries(data.quests)) {
                    const quest = this.game.questManager.quests.get(questId);
                    if (quest) {
                        quest.state = savedQuest.state;
                        for (let i = 0; i < savedQuest.objectives.length && i < quest.objectives.length; i++) {
                            quest.objectives[i].current = savedQuest.objectives[i].current;
                            quest.objectives[i].completed = savedQuest.objectives[i].completed;
                        }
                    }
                }
            }

            // Update system references to current tileMap
            this.game._updateSystemTileMapRefs();

            return true;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    }

    hasSave(slot = 'auto') {
        return localStorage.getItem(this.prefix + slot) !== null;
    }

    deleteSave(slot = 'auto') {
        localStorage.removeItem(this.prefix + slot);
    }

    getSaveSlots() {
        const slots = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                const slot = key.substring(this.prefix.length);
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    slots.push({
                        slot,
                        timestamp: data.timestamp,
                        date: new Date(data.timestamp).toLocaleString(),
                    });
                } catch (e) { /* skip corrupt saves */ }
            }
        }
        return slots.sort((a, b) => b.timestamp - a.timestamp);
    }

    _serializeQuests() {
        const result = {};
        for (const [questId, quest] of this.game.questManager.quests) {
            result[questId] = {
                state: quest.state,
                objectives: quest.objectives.map(obj => ({
                    current: obj.current,
                    completed: obj.completed,
                })),
            };
        }
        return result;
    }

    _serializeEntity(entityId) {
        const components = {};
        for (const [compName, store] of this.game.em.components) {
            if (store.has(entityId)) {
                components[compName] = store.get(entityId);
            }
        }
        return { id: entityId, components };
    }

    _serializeEntities() {
        const entities = [];
        for (const id of this.game.em.entities) {
            entities.push(this._serializeEntity(id));
        }
        return entities;
    }
}
