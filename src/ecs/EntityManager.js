export class EntityManager {
    constructor() {
        this.nextId = 1;
        this.entities = new Set();
        this.components = new Map(); // componentName -> Map<entityId, data>
    }

    create() {
        const id = this.nextId++;
        this.entities.add(id);
        return id;
    }

    destroy(id) {
        this.entities.delete(id);
        for (const store of this.components.values()) {
            store.delete(id);
        }
    }

    add(id, componentName, data) {
        if (!this.components.has(componentName)) {
            this.components.set(componentName, new Map());
        }
        this.components.get(componentName).set(id, data);
    }

    get(id, componentName) {
        const store = this.components.get(componentName);
        return store ? store.get(id) : undefined;
    }

    has(id, componentName) {
        const store = this.components.get(componentName);
        return store ? store.has(id) : false;
    }

    remove(id, componentName) {
        const store = this.components.get(componentName);
        if (store) store.delete(id);
    }

    query(...componentNames) {
        const results = [];
        for (const id of this.entities) {
            let hasAll = true;
            for (const name of componentNames) {
                if (!this.has(id, name)) {
                    hasAll = false;
                    break;
                }
            }
            if (hasAll) results.push(id);
        }
        return results;
    }

    getStore(componentName) {
        return this.components.get(componentName) || new Map();
    }
}
