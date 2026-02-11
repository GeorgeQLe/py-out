import { Colors } from '../render/Colors.js';

export class BarterScreen {
    constructor(entityManager, playerId, eventBus) {
        this.em = entityManager;
        this.playerId = playerId;
        this.eventBus = eventBus;
        this.visible = false;
        this.npcId = null;
        this.activePane = 0; // 0 = player, 1 = merchant
        this.cursor = 0;
        this.message = '';
        this.messageTimer = 0;
    }

    open(npcId) {
        this.npcId = npcId;
        this.visible = true;
        this.activePane = 1; // Default to merchant pane (buying)
        this.cursor = 0;
        this.message = '';
    }

    close() {
        this.visible = false;
        this.npcId = null;
        this.eventBus.emit('barterClosed', {});
    }

    handleInput(key) {
        if (!this.visible) return false;

        switch (key) {
            case 'Escape':
                this.close();
                return true;
            case 'Tab':
                this.activePane = this.activePane === 0 ? 1 : 0;
                this.cursor = 0;
                return true;
            case 'ArrowUp': case 'k':
                this.cursor = Math.max(0, this.cursor - 1);
                return true;
            case 'ArrowDown': case 'j':
                this.cursor = Math.min(this._getActiveItems().length - 1, Math.max(0, this.cursor + 1));
                return true;
            case 'Enter': case ' ':
                if (this.activePane === 1) {
                    this._buyItem();
                } else {
                    this._sellItem();
                }
                return true;
        }
        return true;
    }

    _getPlayerCaps(entityId) {
        const inv = this.em.get(entityId, 'Inventory');
        if (!inv) return 0;
        const caps = inv.items.find(i => i.id === 'bottle_caps');
        return caps ? caps.quantity : 0;
    }

    _modifyCaps(entityId, amount) {
        const inv = this.em.get(entityId, 'Inventory');
        if (!inv) return;
        let caps = inv.items.find(i => i.id === 'bottle_caps');
        if (!caps && amount > 0) {
            caps = { id: 'bottle_caps', name: 'Bottle Caps', type: 'misc', glyph: '$', fg: '#ffcc00', weight: 0, stackable: true, quantity: 0 };
            inv.items.push(caps);
        }
        if (caps) {
            caps.quantity += amount;
            if (caps.quantity <= 0) {
                inv.items.splice(inv.items.indexOf(caps), 1);
            }
        }
    }

    _getItemPrice(item, isSelling) {
        if (item.price) {
            return isSelling ? Math.floor(item.price * 0.5) : item.price;
        }
        // Fallback pricing
        let base = 30; // consumable default
        if (item.type === 'weapon' && item.damageMax) base = item.damageMax * 10;
        else if (item.type === 'armor' && item.dt) base = item.dt * 50;
        else if (item.type === 'ammo') base = 5;
        return isSelling ? Math.floor(base * 0.5) : base;
    }

    _getActiveItems() {
        if (this.activePane === 0) {
            const inv = this.em.get(this.playerId, 'Inventory');
            if (!inv) return [];
            return inv.items.filter(i => i.id !== 'bottle_caps' && i.type !== 'quest');
        } else {
            if (!this.npcId) return [];
            const inv = this.em.get(this.npcId, 'Inventory');
            if (!inv) return [];
            return inv.items.filter(i => i.id !== 'bottle_caps');
        }
    }

    _buyItem() {
        const merchantInv = this.em.get(this.npcId, 'Inventory');
        const playerInv = this.em.get(this.playerId, 'Inventory');
        if (!merchantInv || !playerInv) return;

        const items = merchantInv.items.filter(i => i.id !== 'bottle_caps');
        if (this.cursor >= items.length) return;

        const item = items[this.cursor];
        const price = this._getItemPrice(item, false);
        const playerCaps = this._getPlayerCaps(this.playerId);

        if (playerCaps < price) {
            this._showMessage("Can't afford that!");
            return;
        }

        // Deduct caps
        this._modifyCaps(this.playerId, -price);
        this._modifyCaps(this.npcId, price);

        // Transfer item
        if (item.stackable && item.quantity > 1) {
            item.quantity -= 1;
            // Add one to player
            const existing = playerInv.items.find(i => i.id === item.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                playerInv.items.push({ ...item, quantity: 1 });
            }
        } else {
            merchantInv.items.splice(merchantInv.items.indexOf(item), 1);
            playerInv.items.push({ ...item });
        }

        // Adjust cursor
        const newItems = merchantInv.items.filter(i => i.id !== 'bottle_caps');
        this.cursor = Math.min(this.cursor, Math.max(0, newItems.length - 1));

        this._showMessage(`Bought ${item.name} for ${price} caps.`);
    }

    _sellItem() {
        const merchantInv = this.em.get(this.npcId, 'Inventory');
        const playerInv = this.em.get(this.playerId, 'Inventory');
        if (!merchantInv || !playerInv) return;

        const items = playerInv.items.filter(i => i.id !== 'bottle_caps' && i.type !== 'quest');
        if (this.cursor >= items.length) return;

        const item = items[this.cursor];
        const price = this._getItemPrice(item, true);
        const merchantCaps = this._getPlayerCaps(this.npcId);

        if (merchantCaps < price) {
            this._showMessage("Merchant can't afford that!");
            return;
        }

        // Transfer caps
        this._modifyCaps(this.playerId, price);
        this._modifyCaps(this.npcId, -price);

        // Transfer item
        if (item.stackable && item.quantity > 1) {
            item.quantity -= 1;
            const existing = merchantInv.items.find(i => i.id === item.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                merchantInv.items.push({ ...item, quantity: 1 });
            }
        } else {
            playerInv.items.splice(playerInv.items.indexOf(item), 1);
            merchantInv.items.push({ ...item });
        }

        // Adjust cursor
        const newItems = playerInv.items.filter(i => i.id !== 'bottle_caps' && i.type !== 'quest');
        this.cursor = Math.min(this.cursor, Math.max(0, newItems.length - 1));

        this._showMessage(`Sold ${item.name} for ${price} caps.`);
    }

    _showMessage(msg) {
        this.message = msg;
        this.messageTimer = Date.now();
    }

    render(renderer) {
        if (!this.visible) return;

        const w = 70;
        const h = 24;
        const x = Math.floor((renderer.cols - w) / 2);
        const y = Math.floor((renderer.rows - h) / 2);

        // Background box
        renderer.drawBox(x, y, w, h, Colors.uiBorder, Colors.uiBg);

        // Title
        const npc = this.npcId ? this.em.get(this.npcId, 'NPC') : null;
        const merchantName = npc ? npc.name : 'Merchant';
        renderer.drawText(x + 2, y + 1, 'BARTER', Colors.uiHighlight, Colors.uiBg);

        // Caps display
        const playerCaps = this._getPlayerCaps(this.playerId);
        const merchantCaps = this._getPlayerCaps(this.npcId);
        renderer.drawText(x + 2, y + 2, `Your Caps: ${playerCaps}`, '#ffcc00', Colors.uiBg);
        renderer.drawText(x + 37, y + 2, `${merchantName}'s Caps: ${merchantCaps}`, '#ffcc00', Colors.uiBg);

        // Divider
        const dividerX = x + 35;
        for (let row = y + 3; row < y + h - 2; row++) {
            renderer.drawGlyph(dividerX, row, '|', Colors.uiBorder, Colors.uiBg);
        }

        // Left pane header: YOUR ITEMS
        const leftHL = this.activePane === 0 ? Colors.uiHighlight : Colors.uiDim;
        renderer.drawText(x + 2, y + 3, 'YOUR ITEMS (sell)', leftHL, Colors.uiBg);

        // Right pane header: MERCHANT ITEMS
        const rightHL = this.activePane === 1 ? Colors.uiHighlight : Colors.uiDim;
        renderer.drawText(x + 37, y + 3, `${merchantName} (buy)`, rightHL, Colors.uiBg);

        // Player items (left pane)
        const playerItems = this._getPaneItems(0);
        const maxRows = h - 7;
        for (let i = 0; i < Math.min(playerItems.length, maxRows); i++) {
            const item = playerItems[i];
            const price = this._getItemPrice(item, true);
            const selected = this.activePane === 0 && i === this.cursor;
            const prefix = selected ? '> ' : '  ';
            const fg = selected ? Colors.uiHighlight : Colors.uiText;
            const qty = item.stackable && item.quantity > 1 ? `x${item.quantity}` : '';
            const line = `${prefix}${item.name} ${qty}`.substring(0, 24);
            renderer.drawText(x + 2, y + 4 + i, line, fg, Colors.uiBg);
            renderer.drawText(x + 27, y + 4 + i, `${price}$`, '#ffcc00', Colors.uiBg);
        }
        if (playerItems.length === 0) {
            renderer.drawText(x + 2, y + 4, '  (empty)', Colors.uiDim, Colors.uiBg);
        }

        // Merchant items (right pane)
        const merchantItems = this._getPaneItems(1);
        for (let i = 0; i < Math.min(merchantItems.length, maxRows); i++) {
            const item = merchantItems[i];
            const price = this._getItemPrice(item, false);
            const selected = this.activePane === 1 && i === this.cursor;
            const prefix = selected ? '> ' : '  ';
            const fg = selected ? Colors.uiHighlight : Colors.uiText;
            const qty = item.stackable && item.quantity > 1 ? `x${item.quantity}` : '';
            const line = `${prefix}${item.name} ${qty}`.substring(0, 24);
            renderer.drawText(x + 37, y + 4 + i, line, fg, Colors.uiBg);
            renderer.drawText(x + 62, y + 4 + i, `${price}$`, '#ffcc00', Colors.uiBg);
        }
        if (merchantItems.length === 0) {
            renderer.drawText(x + 37, y + 4, '  (empty)', Colors.uiDim, Colors.uiBg);
        }

        // Message
        if (this.message && Date.now() - this.messageTimer < 2000) {
            renderer.drawText(x + 2, y + h - 3, this.message, Colors.uiHighlight, Colors.uiBg);
        }

        // Help bar
        renderer.drawText(x + 2, y + h - 2, '[j/k]navigate [Tab]switch [Enter]buy/sell [Esc]close', Colors.uiDim, Colors.uiBg);
    }

    _getPaneItems(pane) {
        if (pane === 0) {
            const inv = this.em.get(this.playerId, 'Inventory');
            if (!inv) return [];
            return inv.items.filter(i => i.id !== 'bottle_caps' && i.type !== 'quest');
        } else {
            if (!this.npcId) return [];
            const inv = this.em.get(this.npcId, 'Inventory');
            if (!inv) return [];
            return inv.items.filter(i => i.id !== 'bottle_caps');
        }
    }
}
