import { FOV_RADIUS } from '../core/Constants.js';

// Recursive shadowcasting for FOV computation
const MULT = [
    [1, 0, 0, -1, -1, 0, 0, 1],
    [0, 1, -1, 0, 0, -1, 1, 0],
    [0, 1, 1, 0, 0, -1, -1, 0],
    [1, 0, 0, 1, -1, 0, 0, -1],
];

export class FOVSystem {
    update(tileMap, originX, originY, radius = FOV_RADIUS) {
        tileMap.clearVisibility();
        tileMap.setVisible(originX, originY);

        for (let octant = 0; octant < 8; octant++) {
            this._castLight(tileMap, originX, originY, radius, 1, 1.0, 0.0, octant);
        }
    }

    _castLight(map, cx, cy, radius, row, startSlope, endSlope, octant) {
        if (startSlope < endSlope) return;

        const xx = MULT[0][octant];
        const xy = MULT[1][octant];
        const yx = MULT[2][octant];
        const yy = MULT[3][octant];

        let newStart = startSlope;

        for (let j = row; j <= radius; j++) {
            let blocked = false;

            for (let dx = -j; dx <= 0; dx++) {
                const dy = -j;
                const mx = cx + dx * xx + dy * xy;
                const my = cy + dx * yx + dy * yy;

                const leftSlope = (dx - 0.5) / (dy + 0.5);
                const rightSlope = (dx + 0.5) / (dy - 0.5);

                if (startSlope < rightSlope) continue;
                if (endSlope > leftSlope) break;

                const distSq = dx * dx + dy * dy;
                if (distSq <= radius * radius) {
                    map.setVisible(mx, my);
                }

                if (blocked) {
                    if (map.blocksSight(mx, my)) {
                        newStart = rightSlope;
                        continue;
                    } else {
                        blocked = false;
                        startSlope = newStart;
                    }
                } else if (map.blocksSight(mx, my) && j < radius) {
                    blocked = true;
                    this._castLight(map, cx, cy, radius, j + 1, startSlope, leftSlope, octant);
                    newStart = rightSlope;
                }
            }

            if (blocked) break;
        }
    }
}
