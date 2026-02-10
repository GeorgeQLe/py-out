export class InteractionSystem {
    constructor(entityManager, tileMap, eventBus) {
        this.em = entityManager;
        this.tileMap = tileMap;
        this.eventBus = eventBus;
    }

    interact(entityId, targetX, targetY) {
        // Check for door
        const tileChar = this.tileMap.getTileChar(targetX, targetY);
        if (tileChar === '+') {
            this.tileMap.setTile(targetX, targetY, '/');
            this.eventBus.emit('doorOpened', { x: targetX, y: targetY });
            return true;
        }
        if (tileChar === '/') {
            this.tileMap.setTile(targetX, targetY, '+');
            this.eventBus.emit('doorClosed', { x: targetX, y: targetY });
            return true;
        }

        // Check for entities at position
        const entities = this.em.query('Position');
        for (const eid of entities) {
            if (eid === entityId) continue;
            const pos = this.em.get(eid, 'Position');
            if (pos.x !== targetX || pos.y !== targetY) continue;

            // Container
            if (this.em.has(eid, 'Container')) {
                this.eventBus.emit('openContainer', { entityId: eid });
                return true;
            }

            // Item on ground
            if (this.em.has(eid, 'Item')) {
                return this.pickupItem(entityId, eid);
            }

            // NPC dialogue
            if (this.em.has(eid, 'Dialogue')) {
                this.eventBus.emit('startDialogue', { npcId: eid });
                return true;
            }
        }

        return false;
    }

    pickupItem(entityId, itemEntityId) {
        const inv = this.em.get(entityId, 'Inventory');
        const item = this.em.get(itemEntityId, 'Item');
        if (!inv || !item) return false;

        const currentWeight = this.getCarriedWeight(entityId);
        if (currentWeight + (item.weight || 0) > inv.maxWeight) {
            this.eventBus.emit('combatLog', { text: 'Too heavy to carry!' });
            return false;
        }

        inv.items.push({ ...item });
        this.em.destroy(itemEntityId);
        this.eventBus.emit('itemPickedUp', { entityId, item });
        return true;
    }

    dropItem(entityId, itemIndex) {
        const inv = this.em.get(entityId, 'Inventory');
        const pos = this.em.get(entityId, 'Position');
        if (!inv || !pos || itemIndex < 0 || itemIndex >= inv.items.length) return false;

        const item = inv.items.splice(itemIndex, 1)[0];

        // Create item entity on ground
        const eid = this.em.create();
        this.em.add(eid, 'Position', { x: pos.x, y: pos.y });
        this.em.add(eid, 'Renderable', {
            glyph: item.glyph || '!',
            fg: item.fg || '#6a9fea',
            bg: null,
            layer: 1,
        });
        this.em.add(eid, 'Item', item);

        this.eventBus.emit('itemDropped', { entityId, item });
        return true;
    }

    getCarriedWeight(entityId) {
        const inv = this.em.get(entityId, 'Inventory');
        if (!inv) return 0;
        return inv.items.reduce((sum, item) => sum + (item.weight || 0), 0);
    }

    useItem(entityId, itemIndex) {
        const inv = this.em.get(entityId, 'Inventory');
        const stats = this.em.get(entityId, 'Stats');
        if (!inv || !stats || itemIndex < 0 || itemIndex >= inv.items.length) return false;

        const item = inv.items[itemIndex];
        if (item.type !== 'consumable') return false;

        // Apply consumable effects
        if (item.effects) {
            if (item.effects.healHP) {
                stats.hp = Math.min(stats.maxHP, stats.hp + item.effects.healHP);
            }
            if (item.effects.healAP) {
                stats.ap = Math.min(stats.maxAP, stats.ap + item.effects.healAP);
            }
            if (item.effects.buff) {
                // Store buff on combat state
                const combat = this.em.get(entityId, 'CombatState');
                if (combat) {
                    combat.statusEffects.push({
                        type: item.effects.buff.type,
                        duration: item.effects.buff.duration,
                        strength: item.effects.buff.strength,
                    });
                }
            }
        }

        // Remove consumable (or reduce stack)
        if (item.stackable && item.quantity > 1) {
            item.quantity--;
        } else {
            inv.items.splice(itemIndex, 1);
        }

        this.eventBus.emit('itemUsed', { entityId, item });
        return true;
    }

    equipWeapon(entityId, itemIndex) {
        const inv = this.em.get(entityId, 'Inventory');
        const combat = this.em.get(entityId, 'CombatState');
        if (!inv || !combat || itemIndex < 0 || itemIndex >= inv.items.length) return false;

        const item = inv.items[itemIndex];
        if (item.type !== 'weapon') return false;

        // Unequip current
        if (combat.equippedWeapon && combat.equippedWeapon.id !== 'fists') {
            inv.items.push(combat.equippedWeapon);
        }

        combat.equippedWeapon = inv.items.splice(itemIndex, 1)[0];
        this.eventBus.emit('weaponEquipped', { entityId, weapon: combat.equippedWeapon });
        return true;
    }

    equipArmor(entityId, itemIndex) {
        const inv = this.em.get(entityId, 'Inventory');
        const stats = this.em.get(entityId, 'Stats');
        if (!inv || !stats || itemIndex < 0 || itemIndex >= inv.items.length) return false;

        const item = inv.items[itemIndex];
        if (item.type !== 'armor') return false;

        // Unequip current
        const combat = this.em.get(entityId, 'CombatState');
        if (combat && combat.equippedArmor) {
            // Remove old armor stats
            stats._armorDT = 0;
            stats._armorDR = 0;
            inv.items.push(combat.equippedArmor);
        }

        const armor = inv.items.splice(itemIndex, 1)[0];
        if (combat) combat.equippedArmor = armor;
        stats._armorDT = armor.dt || 0;
        stats._armorDR = armor.dr || 0;
        stats.ac += armor.acBonus || 0;

        this.eventBus.emit('armorEquipped', { entityId, armor });
        return true;
    }
}
