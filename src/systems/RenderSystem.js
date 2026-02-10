import { Colors } from '../render/Colors.js';

export class RenderSystem {
    constructor(renderer, entityManager, tileMap, camera) {
        this.renderer = renderer;
        this.em = entityManager;
        this.tileMap = tileMap;
        this.camera = camera;
    }

    render() {
        this.renderer.clear();
        this._renderTiles();
        this._renderEntities();
    }

    _renderTiles() {
        const { x: cx, y: cy, viewportCols, viewportRows } = this.camera;

        for (let sy = 0; sy < viewportRows; sy++) {
            for (let sx = 0; sx < viewportCols; sx++) {
                const wx = cx + sx;
                const wy = cy + sy;

                if (!this.tileMap.inBounds(wx, wy)) continue;

                if (this.tileMap.isVisible(wx, wy)) {
                    const tile = this.tileMap.getTileType(wx, wy);
                    this.renderer.drawGlyph(sx, sy, tile.glyph, tile.fg, tile.bg || null);
                } else if (this.tileMap.isExplored(wx, wy)) {
                    const tile = this.tileMap.getTileType(wx, wy);
                    const fg = tile.fgExplored || Colors.dimmed;
                    const bg = tile.bgExplored || null;
                    this.renderer.drawGlyph(sx, sy, tile.glyph, fg, bg);
                }
                // Unexplored tiles stay as background (cleared)
            }
        }
    }

    _renderEntities() {
        // Collect renderables, sort by layer
        const entities = this.em.query('Position', 'Renderable');
        entities.sort((a, b) => {
            const ra = this.em.get(a, 'Renderable');
            const rb = this.em.get(b, 'Renderable');
            return ra.layer - rb.layer;
        });

        for (const eid of entities) {
            const pos = this.em.get(eid, 'Position');
            const ren = this.em.get(eid, 'Renderable');

            // Only render if tile is visible
            if (!this.tileMap.isVisible(pos.x, pos.y)) continue;
            if (!this.camera.isVisible(pos.x, pos.y)) continue;

            const sx = pos.x - this.camera.x;
            const sy = pos.y - this.camera.y;
            this.renderer.drawGlyph(sx, sy, ren.glyph, ren.fg, ren.bg);
        }
    }
}
