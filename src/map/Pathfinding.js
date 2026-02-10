export class Pathfinding {
    constructor(tileMap, entityManager) {
        this.tileMap = tileMap;
        this.em = entityManager;
    }

    findPath(startX, startY, goalX, goalY, maxSteps = 50) {
        const open = [];
        const closed = new Set();
        const cameFrom = new Map();

        const key = (x, y) => `${x},${y}`;
        const h = (x, y) => Math.abs(goalX - x) + Math.abs(goalY - y);

        open.push({ x: startX, y: startY, g: 0, f: h(startX, startY) });

        while (open.length > 0) {
            // Find lowest f
            let bestIdx = 0;
            for (let i = 1; i < open.length; i++) {
                if (open[i].f < open[bestIdx].f) bestIdx = i;
            }
            const current = open.splice(bestIdx, 1)[0];
            const ck = key(current.x, current.y);

            if (current.x === goalX && current.y === goalY) {
                return this._reconstructPath(cameFrom, current.x, current.y);
            }

            closed.add(ck);

            if (current.g >= maxSteps) continue;

            const neighbors = [
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y },
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 },
                // Diagonals
                { x: current.x - 1, y: current.y - 1 },
                { x: current.x + 1, y: current.y - 1 },
                { x: current.x - 1, y: current.y + 1 },
                { x: current.x + 1, y: current.y + 1 },
            ];

            for (const n of neighbors) {
                const nk = key(n.x, n.y);
                if (closed.has(nk)) continue;
                if (!this.tileMap.inBounds(n.x, n.y)) continue;

                // Allow goal tile even if blocked (for targeting)
                if (n.x !== goalX || n.y !== goalY) {
                    if (this.tileMap.blocksMove(n.x, n.y)) continue;
                    if (this._entityBlocksAt(n.x, n.y)) continue;
                }

                const moveCost = this.tileMap.getTileType(n.x, n.y).moveCost || 1;
                const g = current.g + moveCost;
                const f = g + h(n.x, n.y);

                const existing = open.find(o => o.x === n.x && o.y === n.y);
                if (existing) {
                    if (g < existing.g) {
                        existing.g = g;
                        existing.f = f;
                        cameFrom.set(nk, ck);
                    }
                } else {
                    open.push({ x: n.x, y: n.y, g, f });
                    cameFrom.set(nk, ck);
                }
            }
        }

        return null; // No path found
    }

    _entityBlocksAt(x, y) {
        const blockers = this.em.query('Position', 'Blocker');
        for (const bid of blockers) {
            const bp = this.em.get(bid, 'Position');
            const blocker = this.em.get(bid, 'Blocker');
            if (bp.x === x && bp.y === y && blocker.blocksMove) return true;
        }
        return false;
    }

    _reconstructPath(cameFrom, endX, endY) {
        const path = [];
        let current = `${endX},${endY}`;
        while (cameFrom.has(current)) {
            const [x, y] = current.split(',').map(Number);
            path.unshift({ x, y });
            current = cameFrom.get(current);
        }
        return path;
    }
}
