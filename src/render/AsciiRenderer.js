import { CELL_WIDTH, CELL_HEIGHT } from '../core/Constants.js';
import { GlyphAtlas } from './GlyphAtlas.js';
import { Colors } from './Colors.js';

export class AsciiRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.atlas = new GlyphAtlas();
        this.cols = 0;
        this.rows = 0;
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.floor(this.canvas.width / CELL_WIDTH);
        this.rows = Math.floor(this.canvas.height / CELL_HEIGHT);
    }

    clear() {
        this.ctx.fillStyle = Colors.bgDefault;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGlyph(col, row, glyph, fg, bg) {
        const x = col * CELL_WIDTH;
        const y = row * CELL_HEIGHT;

        if (bg) {
            this.ctx.fillStyle = bg;
            this.ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
        }

        const cached = this.atlas.get(glyph, fg, bg);
        this.ctx.drawImage(cached, x, y);
    }

    drawText(col, row, text, fg = Colors.uiText, bg = null) {
        for (let i = 0; i < text.length; i++) {
            this.drawGlyph(col + i, row, text[i], fg, bg);
        }
    }

    drawBox(col, row, width, height, fg = Colors.uiBorder, bg = Colors.uiBg) {
        // Fill background
        for (let y = row; y < row + height; y++) {
            for (let x = col; x < col + width; x++) {
                this.drawGlyph(x, y, ' ', fg, bg);
            }
        }
        // Corners
        this.drawGlyph(col, row, '+', fg, bg);
        this.drawGlyph(col + width - 1, row, '+', fg, bg);
        this.drawGlyph(col, row + height - 1, '+', fg, bg);
        this.drawGlyph(col + width - 1, row + height - 1, '+', fg, bg);
        // Horizontal edges
        for (let x = col + 1; x < col + width - 1; x++) {
            this.drawGlyph(x, row, '-', fg, bg);
            this.drawGlyph(x, row + height - 1, '-', fg, bg);
        }
        // Vertical edges
        for (let y = row + 1; y < row + height - 1; y++) {
            this.drawGlyph(col, y, '|', fg, bg);
            this.drawGlyph(col + width - 1, y, '|', fg, bg);
        }
    }
}
