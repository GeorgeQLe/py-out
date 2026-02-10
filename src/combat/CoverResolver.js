import { TileTypes } from '../map/TileTypes.js';

export const CoverType = {
    NONE: 0,
    HALF: 1,
    FULL: 2,
};

export class CoverResolver {
    constructor(tileMap, entityManager) {
        this.tileMap = tileMap;
        this.em = entityManager;
    }

    getCoverBetween(attackerX, attackerY, targetX, targetY) {
        // Check tiles adjacent to the target that are between attacker and target
        const dx = Math.sign(attackerX - targetX);
        const dy = Math.sign(attackerY - targetY);

        // Check the tile(s) the target would be "behind" relative to attacker
        let bestCover = CoverType.NONE;

        const checkPositions = [];
        if (dx !== 0) checkPositions.push({ x: targetX + dx, y: targetY });
        if (dy !== 0) checkPositions.push({ x: targetX, y: targetY + dy });
        if (dx !== 0 && dy !== 0) checkPositions.push({ x: targetX + dx, y: targetY + dy });

        for (const pos of checkPositions) {
            if (!this.tileMap.inBounds(pos.x, pos.y)) continue;
            const tile = this.tileMap.getTileType(pos.x, pos.y);

            if (tile.blocksMove && tile.blocksSight) {
                bestCover = Math.max(bestCover, CoverType.FULL);
            } else if (tile.providesHalfCover || tile.blocksMove) {
                bestCover = Math.max(bestCover, CoverType.HALF);
            }
        }

        // Check entity blockers providing cover
        const blockers = this.em.query('Position', 'Blocker');
        for (const bid of blockers) {
            const bp = this.em.get(bid, 'Position');
            for (const pos of checkPositions) {
                if (bp.x === pos.x && bp.y === pos.y) {
                    bestCover = Math.max(bestCover, CoverType.HALF);
                }
            }
        }

        return bestCover;
    }

    getCoverBonus(coverType) {
        switch (coverType) {
            case CoverType.HALF: return 20;
            case CoverType.FULL: return 40;
            default: return 0;
        }
    }

    isFlanking(attackerX, attackerY, targetX, targetY) {
        // Flanking: cover exists but none of it lies along the attacker's angle
        const cover = this.getCoverBetween(attackerX, attackerY, targetX, targetY);
        if (cover === CoverType.NONE) return false;

        const dx = Math.sign(attackerX - targetX);
        const dy = Math.sign(attackerY - targetY);

        // Build the same list of cover-candidate positions as getCoverBetween
        const checkPositions = [];
        if (dx !== 0) checkPositions.push({ x: targetX + dx, y: targetY });
        if (dy !== 0) checkPositions.push({ x: targetX, y: targetY + dy });
        if (dx !== 0 && dy !== 0) checkPositions.push({ x: targetX + dx, y: targetY + dy });

        // If ANY of those tiles actually provides cover, it's not a flank
        for (const pos of checkPositions) {
            if (!this.tileMap.inBounds(pos.x, pos.y)) continue;
            const tile = this.tileMap.getTileType(pos.x, pos.y);
            if (tile.blocksMove || tile.blocksSight || tile.providesHalfCover) {
                return false;
            }
        }

        // Also check entity blockers
        const blockers = this.em.query('Position', 'Blocker');
        for (const bid of blockers) {
            const bp = this.em.get(bid, 'Position');
            for (const pos of checkPositions) {
                if (bp.x === pos.x && bp.y === pos.y) {
                    return false;
                }
            }
        }

        // Cover exists (from getCoverBetween) but none is along the attacker's angle
        return true;
    }
}
