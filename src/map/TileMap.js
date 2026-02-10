import { TileTypes } from './TileTypes.js';

export class TileMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = new Array(width * height).fill('.');
        this.visible = new Uint8Array(width * height);   // currently in FOV
        this.explored = new Uint8Array(width * height);   // ever seen
    }

    idx(x, y) {
        return y * this.width + x;
    }

    inBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    getTileChar(x, y) {
        if (!this.inBounds(x, y)) return '#';
        return this.tiles[this.idx(x, y)];
    }

    setTile(x, y, ch) {
        if (this.inBounds(x, y)) {
            this.tiles[this.idx(x, y)] = ch;
        }
    }

    getTileType(x, y) {
        return TileTypes[this.getTileChar(x, y)] || TileTypes['.'];
    }

    blocksMove(x, y) {
        return this.getTileType(x, y).blocksMove;
    }

    blocksSight(x, y) {
        if (!this.inBounds(x, y)) return true;
        return this.getTileType(x, y).blocksSight;
    }

    isVisible(x, y) {
        if (!this.inBounds(x, y)) return false;
        return this.visible[this.idx(x, y)] === 1;
    }

    isExplored(x, y) {
        if (!this.inBounds(x, y)) return false;
        return this.explored[this.idx(x, y)] === 1;
    }

    clearVisibility() {
        this.visible.fill(0);
    }

    setVisible(x, y) {
        if (!this.inBounds(x, y)) return;
        const i = this.idx(x, y);
        this.visible[i] = 1;
        this.explored[i] = 1;
    }
}
