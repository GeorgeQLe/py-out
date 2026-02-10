import { Colors } from '../render/Colors.js';

export class InventoryScreen {
    constructor(entityManager, playerId, interactionSystem, eventBus) {
        this.em = entityManager;
        this.playerId = playerId;
        this.interaction = interactionSystem;
        this.eventBus = eventBus;
        this.visible = false;
        this.cursor = 0;
        this.contextMenuOpen = false;
        this.contextCursor = 0;
    }

    toggle() {
        this.visible = !this.visible;
        this.cursor = 0;
        this.contextMenuOpen = false;
    }

    handleInput(key) {
        if (!this.visible) return false;

        if (this.contextMenuOpen) {
            return this._handleContextMenu(key);
        }

        const inv = this.em.get(this.playerId, 'Inventory');
        if (!inv) return true;

        if (inv.items.length === 0) {
            if (key === 'i' || key === 'Escape') this.visible = false;
            return true;
        }

        switch (key) {
            case 'ArrowUp': case 'k':
                this.cursor = Math.max(0, this.cursor - 1);
                return true;
            case 'ArrowDown': case 'j':
                this.cursor = Math.min(inv.items.length - 1, this.cursor + 1);
                return true;
            case 'Enter': case ' ':
                if (inv.items.length > 0) {
                    this.contextMenuOpen = true;
                    this.contextCursor = 0;
                }
                return true;
            case 'i': case 'Escape':
                this.visible = false;
                return true;
            case 'd':
                if (inv.items.length > 0) {
                    this.interaction.dropItem(this.playerId, this.cursor);
                    this.cursor = Math.max(0, Math.min(this.cursor, inv.items.length - 1));
                }
                return true;
        }
        return true;
    }

    _handleContextMenu(key) {
        const inv = this.em.get(this.playerId, 'Inventory');
        const item = inv.items[this.cursor];
        if (!item) { this.contextMenuOpen = false; return true; }

        const actions = this._getActions(item);

        switch (key) {
            case 'ArrowUp': case 'k':
                this.contextCursor = Math.max(0, this.contextCursor - 1);
                return true;
            case 'ArrowDown': case 'j':
                this.contextCursor = Math.min(actions.length - 1, this.contextCursor + 1);
                return true;
            case 'Enter': case ' ':
                this._executeAction(actions[this.contextCursor], this.cursor);
                this.contextMenuOpen = false;
                return true;
            case 'Escape':
                this.contextMenuOpen = false;
                return true;
        }
        return true;
    }

    _getActions(item) {
        const actions = [];
        if (item.type === 'weapon') actions.push('Equip');
        if (item.type === 'armor') actions.push('Equip');
        if (item.type === 'consumable') actions.push('Use');
        actions.push('Drop');
        actions.push('Cancel');
        return actions;
    }

    _executeAction(action, index) {
        switch (action) {
            case 'Equip': {
                const item = this.em.get(this.playerId, 'Inventory').items[index];
                if (item.type === 'weapon') this.interaction.equipWeapon(this.playerId, index);
                else if (item.type === 'armor') this.interaction.equipArmor(this.playerId, index);
                break;
            }
            case 'Use':
                this.interaction.useItem(this.playerId, index);
                break;
            case 'Drop':
                this.interaction.dropItem(this.playerId, index);
                break;
        }
    }

    render(renderer) {
        if (!this.visible) return;

        const inv = this.em.get(this.playerId, 'Inventory');
        if (!inv) return;

        const w = 50;
        const h = Math.min(25, inv.items.length + 8);
        const x = Math.floor((renderer.cols - w) / 2);
        const y = Math.floor((renderer.rows - h) / 2);

        renderer.drawBox(x, y, w, h, Colors.uiBorder, Colors.uiBg);
        renderer.drawText(x + 2, y + 1, 'INVENTORY', Colors.uiHighlight, Colors.uiBg);

        const weight = this.interaction.getCarriedWeight(this.playerId);
        renderer.drawText(x + 2, y + 2, `Weight: ${weight}/${inv.maxWeight}`, Colors.uiDim, Colors.uiBg);

        // Equipped
        const combat = this.em.get(this.playerId, 'CombatState');
        if (combat) {
            const wName = combat.equippedWeapon ? combat.equippedWeapon.name : 'None';
            const aName = combat.equippedArmor ? combat.equippedArmor.name : 'None';
            renderer.drawText(x + 2, y + 3, `Weapon: ${wName}  Armor: ${aName}`, Colors.uiDim, Colors.uiBg);
        }

        if (inv.items.length === 0) {
            renderer.drawText(x + 2, y + 5, 'Empty.', Colors.uiDim, Colors.uiBg);
        } else {
            for (let i = 0; i < inv.items.length && i < h - 7; i++) {
                const item = inv.items[i];
                const selected = i === this.cursor;
                const prefix = selected ? '> ' : '  ';
                const fg = selected ? Colors.uiHighlight : Colors.uiText;
                const qty = item.stackable && item.quantity > 1 ? ` (x${item.quantity})` : '';
                const wt = item.weight ? ` [${item.weight}lb]` : '';
                renderer.drawText(x + 2, y + 5 + i, `${prefix}${item.name}${qty}${wt}`, fg, Colors.uiBg);
            }
        }

        // Context menu
        if (this.contextMenuOpen && inv.items.length > 0) {
            const item = inv.items[this.cursor];
            const actions = this._getActions(item);
            const cmx = x + w - 15;
            const cmy = y + 5 + this.cursor;
            renderer.drawBox(cmx, cmy, 14, actions.length + 2, Colors.uiBorder, '#111');
            for (let i = 0; i < actions.length; i++) {
                const sel = i === this.contextCursor;
                renderer.drawText(cmx + 1, cmy + 1 + i, `${sel ? '>' : ' '} ${actions[i]}`, sel ? Colors.uiHighlight : Colors.uiText, '#111');
            }
        }

        renderer.drawText(x + 2, y + h - 2, '[j/k]navigate [Enter]action [d]rop [i/Esc]close', Colors.uiDim, Colors.uiBg);
    }
}
