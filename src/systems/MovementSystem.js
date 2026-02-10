export class MovementSystem {
    constructor(entityManager, tileMap, eventBus) {
        this.em = entityManager;
        this.tileMap = tileMap;
        this.eventBus = eventBus;
    }

    tryMove(entityId, dx, dy) {
        const pos = this.em.get(entityId, 'Position');
        if (!pos) return false;

        const nx = pos.x + dx;
        const ny = pos.y + dy;

        // Block diagonal corner-cutting
        if (dx !== 0 && dy !== 0) {
            const adjX = this.tileMap.blocksMove(pos.x + dx, pos.y);
            const adjY = this.tileMap.blocksMove(pos.x, pos.y + dy);
            if (adjX && adjY) return false;
        }

        // Check tile
        if (this.tileMap.blocksMove(nx, ny)) {
            // Check if it's a door we can open
            const ch = this.tileMap.getTileChar(nx, ny);
            if (ch === '+') {
                this.tileMap.setTile(nx, ny, '/');
                this.eventBus.emit('doorOpened', { x: nx, y: ny });
                return true;
            }
            return false;
        }

        // Check entity blockers at target
        const blockers = this.em.query('Position', 'Blocker');
        for (const bid of blockers) {
            const bp = this.em.get(bid, 'Position');
            const blocker = this.em.get(bid, 'Blocker');
            if (bp.x === nx && bp.y === ny && blocker.blocksMove) {
                return false;
            }
        }

        pos.x = nx;
        pos.y = ny;
        this.eventBus.emit('entityMoved', { entityId, x: nx, y: ny });
        return true;
    }
}
