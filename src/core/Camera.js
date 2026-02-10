import { CELL_WIDTH, CELL_HEIGHT } from './Constants.js';
import { clamp } from './Utils.js';

export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.viewportCols = 0;
        this.viewportRows = 0;
    }

    resize(canvasWidth, canvasHeight) {
        this.viewportCols = Math.floor(canvasWidth / CELL_WIDTH);
        this.viewportRows = Math.floor(canvasHeight / CELL_HEIGHT);
    }

    follow(targetX, targetY, mapWidth, mapHeight) {
        this.x = clamp(
            targetX - Math.floor(this.viewportCols / 2),
            0,
            Math.max(0, mapWidth - this.viewportCols)
        );
        this.y = clamp(
            targetY - Math.floor(this.viewportRows / 2),
            0,
            Math.max(0, mapHeight - this.viewportRows)
        );
    }

    worldToScreen(wx, wy) {
        return {
            x: (wx - this.x) * CELL_WIDTH,
            y: (wy - this.y) * CELL_HEIGHT,
        };
    }

    screenToWorld(sx, sy) {
        return {
            x: Math.floor(sx / CELL_WIDTH) + this.x,
            y: Math.floor(sy / CELL_HEIGHT) + this.y,
        };
    }

    isVisible(wx, wy) {
        return wx >= this.x && wx < this.x + this.viewportCols &&
               wy >= this.y && wy < this.y + this.viewportRows;
    }
}
