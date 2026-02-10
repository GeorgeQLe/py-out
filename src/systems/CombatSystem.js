import { distance, rollPercent } from '../core/Utils.js';
import { GameState } from '../core/Constants.js';
import { CombatState } from '../ecs/components/CombatState.js';

export class CombatSystem {
    constructor(game, turnManager, hitCalculation, damageCalculation, overwatch, eventBus) {
        this.game = game;
        this.turnManager = turnManager;
        this.hitCalc = hitCalculation;
        this.damageCalc = damageCalculation;
        this.overwatch = overwatch;
        this.eventBus = eventBus;
        this.em = game.em;
    }

    initiateCombat(instigatorId, targetIds) {
        const participants = [instigatorId, ...targetIds];
        // Add CombatState if missing
        for (const id of participants) {
            if (!this.em.has(id, 'CombatState')) {
                this.em.add(id, 'CombatState', CombatState());
            }
        }
        this.turnManager.startCombat(participants);
        this.game.state = GameState.COMBAT;
    }

    attemptShot(attackerId, targetId, bodyPart = null) {
        const attackerStats = this.em.get(attackerId, 'Stats');
        const targetStats = this.em.get(targetId, 'Stats');
        const attackerPos = this.em.get(attackerId, 'Position');
        const targetPos = this.em.get(targetId, 'Position');
        const combat = this.em.get(attackerId, 'CombatState');

        if (!attackerStats || !targetStats || !attackerPos || !targetPos) return null;

        const weapon = combat.equippedWeapon;
        if (!weapon) {
            this.eventBus.emit('combatLog', { text: 'No weapon equipped!' });
            return null;
        }

        const apCost = bodyPart ? (weapon.apCostAimed || 5) : (weapon.apCost || 4);
        if (attackerStats.ap < apCost) {
            this.eventBus.emit('combatLog', { text: 'Not enough AP!' });
            return null;
        }

        // Check range
        const dist = distance(attackerPos.x, attackerPos.y, targetPos.x, targetPos.y);
        if (dist > weapon.range) {
            this.eventBus.emit('combatLog', { text: 'Target out of range!' });
            return null;
        }

        // Check and consume ammo
        if (weapon.ammoType) {
            const inv = this.em.get(attackerId, 'Inventory');
            const ammoItem = inv && inv.items.find(i => i.type === 'ammo' && i.id === weapon.ammoType);
            if (!ammoItem || ammoItem.quantity <= 0) {
                this.eventBus.emit('combatLog', { text: 'Out of ammo!' });
                return null;
            }
            ammoItem.quantity -= 1;
            if (ammoItem.quantity <= 0) {
                inv.items.splice(inv.items.indexOf(ammoItem), 1);
            }
        }

        attackerStats.ap -= apCost;

        const hitResult = this.hitCalc.calculate(
            attackerStats, targetStats, attackerPos, targetPos, weapon, bodyPart
        );

        const rolled = rollPercent();
        const hit = rolled <= hitResult.hitChance;

        let damageResult = null;
        if (hit) {
            damageResult = this.damageCalc.calculate(
                attackerStats, targetStats, weapon, bodyPart, hitResult.flanking
            );
            targetStats.hp -= damageResult.damage;

            // Apply body part effects
            if (damageResult.effect) {
                this._applyEffect(targetId, damageResult.effect);
            }

            this.eventBus.emit('entityDamaged', {
                targetId,
                damage: damageResult.damage,
                isCrit: damageResult.isCrit,
            });
        }

        const result = {
            hit,
            hitChance: hitResult.hitChance,
            rolled,
            damage: damageResult,
            cover: hitResult.cover,
            flanking: hitResult.flanking,
        };

        this.eventBus.emit('shotFired', {
            attackerId, targetId, bodyPart, result,
        });

        // Check death
        if (targetStats.hp <= 0) {
            this._handleDeath(targetId);
        }

        return result;
    }

    attemptMelee(attackerId, targetId) {
        const attackerStats = this.em.get(attackerId, 'Stats');
        const targetStats = this.em.get(targetId, 'Stats');
        if (!attackerStats || !targetStats) return null;

        if (attackerStats.ap < 3) {
            this.eventBus.emit('combatLog', { text: 'Not enough AP!' });
            return null;
        }

        attackerStats.ap -= 3;
        const skill = attackerStats.skills.melee || 50;
        const hitChance = Math.min(95, Math.max(5, skill + (attackerStats.strength - 5) * 4 - targetStats.ac));
        const hit = rollPercent() <= hitChance;

        let damage = 0;
        if (hit) {
            damage = Math.max(1, attackerStats.meleeDamage + attackerStats.strength - 5);
            targetStats.hp -= damage;
            this.eventBus.emit('entityDamaged', { targetId, damage, isCrit: false });
        }

        this.eventBus.emit('meleAttack', { attackerId, targetId, hit, damage });

        if (targetStats.hp <= 0) {
            this._handleDeath(targetId);
        }

        return { hit, damage };
    }

    combatMove(entityId, dx, dy) {
        const stats = this.em.get(entityId, 'Stats');
        if (!stats || stats.ap < 1) {
            this.eventBus.emit('combatLog', { text: 'Not enough AP to move!' });
            return false;
        }

        const moved = this.game.movementSystem.tryMove(entityId, dx, dy);
        if (moved) {
            stats.ap -= 1;
            // Check overwatch reactions
            this.overwatch.checkReactionFire(entityId);
        }
        return moved;
    }

    endTurn() {
        this.turnManager.nextTurn();
    }

    _applyEffect(entityId, effect) {
        const combat = this.em.get(entityId, 'CombatState');
        if (!combat) return;

        combat.statusEffects.push({
            type: effect,
            duration: 3,
            strength: 1,
        });

        this.eventBus.emit('statusApplied', { entityId, effect });
    }

    _handleDeath(entityId) {
        this.eventBus.emit('entityDied', { entityId });
        this.turnManager.removeEntity(entityId);

        // Check combat end
        const remaining = this.turnManager.turnOrder;
        const factions = new Set();
        for (const entry of remaining) {
            const faction = this.em.get(entry.id, 'Faction');
            if (faction) factions.add(faction.id);
        }

        if (factions.size <= 1) {
            this.turnManager.endCombat();
        }

        // Check player death
        if (this.em.has(entityId, 'Player')) {
            this.game.state = GameState.GAME_OVER;
            this.eventBus.emit('gameOver', {});
        }
    }
}
