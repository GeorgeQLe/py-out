import { CoverType } from '../combat/CoverResolver.js';

export class CoverMap {
    constructor(tileMap) {
        this.tileMap = tileMap;
        this.coverValues = new Uint8Array(tileMap.width * tileMap.height);
        this.precompute();
    }

    precompute() {
        const { width, height } = this.tileMap;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.coverValues[y * width + x] = this._computeCoverAt(x, y);
            }
        }
    }

    _computeCoverAt(x, y) {
        // A tile provides cover if any adjacent tile is a wall/blocker
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        let bestCover = CoverType.NONE;

        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (!this.tileMap.inBounds(nx, ny)) continue;
            const tile = this.tileMap.getTileType(nx, ny);
            if (tile.blocksMove && tile.blocksSight) {
                bestCover = Math.max(bestCover, CoverType.FULL);
            } else if (tile.providesHalfCover || (tile.blocksMove && !tile.blocksSight)) {
                bestCover = Math.max(bestCover, CoverType.HALF);
            }
        }
        return bestCover;
    }

    getCoverAt(x, y) {
        if (!this.tileMap.inBounds(x, y)) return CoverType.NONE;
        return this.coverValues[y * this.tileMap.width + x];
    }
}
