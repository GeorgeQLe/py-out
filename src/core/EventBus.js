export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        const cbs = this.listeners.get(event);
        if (cbs) {
            const idx = cbs.indexOf(callback);
            if (idx !== -1) cbs.splice(idx, 1);
        }
    }

    emit(event, data) {
        const cbs = this.listeners.get(event);
        if (cbs) {
            for (const cb of cbs) {
                try {
                    cb(data);
                } catch (err) {
                    console.error(`EventBus: error in '${event}' listener:`, err);
                }
            }
        }
    }
}
