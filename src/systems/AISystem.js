import { distance } from '../core/Utils.js';
import { isHostile } from '../ecs/components/Faction.js';

export class AISystem {
    constructor(entityManager, combatSystem, pathfinding, tileMap, eventBus) {
        this.em = entityManager;
        this.combatSystem = combatSystem;
        this.pathfinding = pathfinding;
        this.tileMap = tileMap;
        this.eventBus = eventBus;
    }

    executeTurn(entityId) {
        const stats = this.em.get(entityId, 'Stats');
        const pos = this.em.get(entityId, 'Position');
        const combat = this.em.get(entityId, 'CombatState');
        const faction = this.em.get(entityId, 'Faction');
        const ai = this.em.get(entityId, 'AI');

        if (!stats || !pos || !combat || !faction) return;

        // Find enemies
        const enemies = this._findEnemies(entityId, faction);
        if (enemies.length === 0) {
            this.combatSystem.endTurn();
            return;
        }

        // Sort by distance
        enemies.sort((a, b) => a.dist - b.dist);
        const nearest = enemies[0];

        // Utility-based decision making
        const actions = this._evaluateActions(entityId, stats, pos, combat, nearest, ai);
        actions.sort((a, b) => b.score - a.score);

        // Execute best actions until out of AP
        for (const action of actions) {
            if (stats.ap <= 0) break;
            this._executeAction(entityId, action, stats, pos, combat, nearest);
        }

        this.combatSystem.endTurn();
    }

    _findEnemies(entityId, faction) {
        const pos = this.em.get(entityId, 'Position');
        const entities = this.em.query('Position', 'Stats', 'Faction');
        const enemies = [];

        for (const eid of entities) {
            if (eid === entityId) continue;
            const ef = this.em.get(eid, 'Faction');
            const es = this.em.get(eid, 'Stats');
            if (es.hp <= 0) continue;
            if (!isHostile(faction.id, ef.id)) continue;
            const ep = this.em.get(eid, 'Position');
            enemies.push({
                id: eid,
                pos: ep,
                stats: es,
                dist: distance(pos.x, pos.y, ep.x, ep.y),
            });
        }
        return enemies;
    }

    _evaluateActions(entityId, stats, pos, combat, nearest, ai) {
        const actions = [];
        const weapon = combat.equippedWeapon;

        // Shoot
        if (weapon && stats.ap >= weapon.apCost && nearest.dist <= weapon.range) {
            actions.push({
                type: 'shoot',
                score: 80 + (nearest.dist < weapon.range / 2 ? 20 : 0),
            });
        }

        // Move toward enemy
        if (nearest.dist > 2 && stats.ap >= 1) {
            actions.push({
                type: 'moveToward',
                score: weapon ? 40 : 90, // higher if no weapon (melee)
            });
        }

        // Melee
        if (nearest.dist <= 1.5 && stats.ap >= 3) {
            actions.push({
                type: 'melee',
                score: 70,
            });
        }

        // Take cover (move to adjacent cover tile)
        if (stats.ap >= 2 && stats.hp < stats.maxHP * 0.5) {
            actions.push({
                type: 'seekCover',
                score: 60,
            });
        }

        // Overwatch
        if (stats.ap >= 3 && weapon && nearest.dist > weapon.range * 0.5) {
            actions.push({
                type: 'overwatch',
                score: 30,
            });
        }

        return actions;
    }

    _executeAction(entityId, action, stats, pos, combat, nearest) {
        switch (action.type) {
            case 'shoot':
                this.combatSystem.attemptShot(entityId, nearest.id);
                break;

            case 'melee':
                this.combatSystem.attemptMelee(entityId, nearest.id);
                break;

            case 'moveToward': {
                const path = this.pathfinding.findPath(pos.x, pos.y, nearest.pos.x, nearest.pos.y);
                if (path && path.length > 1) {
                    // Move up to AP limit (leave some for shooting)
                    const weapon = combat.equippedWeapon;
                    const reserveAP = weapon ? weapon.apCost : 0;
                    const maxMoves = Math.min(path.length - 1, stats.ap - reserveAP);
                    for (let i = 0; i < maxMoves && stats.ap > reserveAP; i++) {
                        const step = path[i];
                        const dx = step.x - pos.x;
                        const dy = step.y - pos.y;
                        this.combatSystem.combatMove(entityId, dx, dy);
                    }
                }
                break;
            }

            case 'seekCover': {
                // Simple: move away from nearest enemy
                const dx = Math.sign(pos.x - nearest.pos.x);
                const dy = Math.sign(pos.y - nearest.pos.y);
                this.combatSystem.combatMove(entityId, dx, dy);
                break;
            }

            case 'overwatch':
                this.combatSystem.overwatch.setOverwatch(entityId);
                stats.ap = 0;
                break;
        }
    }
}
