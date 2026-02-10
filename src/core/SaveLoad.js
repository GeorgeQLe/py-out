export class SaveLoad {
    constructor(game) {
        this.game = game;
        this.prefix = 'wasteland_protocol_';
    }

    save(slot = 'auto') {
        const data = {
            version: 1,
            timestamp: Date.now(),
            state: this.game.state,
            player: this._serializeEntity(this.game.playerId),
            tileMap: {
                width: this.game.tileMap.width,
                height: this.game.tileMap.height,
                tiles: Array.from(this.game.tileMap.tiles),
                explored: Array.from(this.game.tileMap.explored),
            },
            entities: this._serializeEntities(),
            nextEntityId: this.game.em.nextId,
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
            if (data.version !== 1) return false;

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
