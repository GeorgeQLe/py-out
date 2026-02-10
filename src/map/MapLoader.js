import { TileMap } from './TileMap.js';
import { Position } from '../ecs/components/Position.js';
import { Renderable } from '../ecs/components/Renderable.js';
import { Blocker } from '../ecs/components/Blocker.js';
import { Colors } from '../render/Colors.js';

export class MapLoader {
    static load(mapData, entityManager) {
        const lines = mapData.layout.trim().split('\n');
        const height = lines.length;
        const width = Math.max(...lines.map(l => l.length));
        const tileMap = new TileMap(width, height);
        let playerStart = null;

        for (let y = 0; y < height; y++) {
            const line = lines[y];
            for (let x = 0; x < width; x++) {
                const ch = x < line.length ? line[x] : '.';

                if (ch === '@') {
                    playerStart = { x, y };
                    tileMap.setTile(x, y, '.');
                } else if (ch === ' ') {
                    tileMap.setTile(x, y, '#');
                } else {
                    tileMap.setTile(x, y, ch);
                }
            }
        }

        // Spawn entities from mapData.entities
        if (mapData.entities) {
            for (const def of mapData.entities) {
                const eid = entityManager.create();
                entityManager.add(eid, 'Position', Position(def.x, def.y));
                if (def.renderable) {
                    entityManager.add(eid, 'Renderable', Renderable(
                        def.renderable.glyph,
                        def.renderable.fg,
                        def.renderable.bg,
                        def.renderable.layer || 1
                    ));
                }
                if (def.blocker) {
                    entityManager.add(eid, 'Blocker', Blocker(def.blocker.blocksMove, def.blocker.blocksSight));
                }
                if (def.tags) {
                    for (const [tag, data] of Object.entries(def.tags)) {
                        entityManager.add(eid, tag, data);
                    }
                }
            }
        }

        return { tileMap, playerStart: playerStart || { x: 1, y: 1 } };
    }
}
