import { CELL_WIDTH, CELL_HEIGHT, FONT_SIZE, FONT_FAMILY } from '../core/Constants.js';

export class GlyphAtlas {
    constructor() {
        this.cache = new Map();
        this.measureCanvas = document.createElement('canvas');
        this.measureCtx = this.measureCanvas.getContext('2d');
    }

    _key(glyph, fg, bg) {
        return `${glyph}|${fg}|${bg || ''}`;
    }

    get(glyph, fg, bg) {
        const key = this._key(glyph, fg, bg);
        if (this.cache.has(key)) return this.cache.get(key);

        if (this.cache.size >= 1024) {
            this.cache.clear();
        }

        const canvas = document.createElement('canvas');
        canvas.width = CELL_WIDTH;
        canvas.height = CELL_HEIGHT;
        const ctx = canvas.getContext('2d');

        if (bg) {
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
        }

        ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = fg;
        ctx.fillText(glyph, CELL_WIDTH / 2, CELL_HEIGHT / 2);

        this.cache.set(key, canvas);
        return canvas;
    }

    clear() {
        this.cache.clear();
    }
}
