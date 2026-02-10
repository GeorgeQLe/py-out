import { CELL_WIDTH, CELL_HEIGHT } from './Constants.js';

export class Input {
    constructor(canvas, eventBus) {
        this.canvas = canvas;
        this.eventBus = eventBus;
        this.keys = new Set();
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseCell = { x: 0, y: 0 };

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onClick = this._onClick.bind(this);

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        canvas.addEventListener('mousemove', this._onMouseMove);
        canvas.addEventListener('click', this._onClick);
    }

    _onKeyDown(e) {
        if (e.repeat) return;
        this.keys.add(e.key);
        this.eventBus.emit('keydown', { key: e.key, shift: e.shiftKey, ctrl: e.ctrlKey });
    }

    _onKeyUp(e) {
        this.keys.delete(e.key);
    }

    _onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;
        this.mouseCell.x = Math.floor(this.mouseX / CELL_WIDTH);
        this.mouseCell.y = Math.floor(this.mouseY / CELL_HEIGHT);
    }

    _onClick(e) {
        this._onMouseMove(e);
        this.eventBus.emit('click', { ...this.mouseCell, pixelX: this.mouseX, pixelY: this.mouseY });
    }

    isDown(key) {
        return this.keys.has(key);
    }
}
