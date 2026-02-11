import { Colors } from '../render/Colors.js';
import { PerkDefinitions } from '../rpg/PerkDefinitions.js';
import { skillNames, skillDisplayNames } from '../data/tables.js';

export class LevelUpUI {
    constructor(entityManager, playerId, levelUpSystem, perkSystem, eventBus) {
        this.em = entityManager;
        this.playerId = playerId;
        this.levelUpSystem = levelUpSystem;
        this.perkSystem = perkSystem;
        this.eventBus = eventBus;
        this.visible = false;

        this.tab = 0; // 0=skills, 1=perks, 2=confirm
        this.cursor = 0;
        this.skillPoints = 0;
        this.canPickPerk = false;
        this.allocations = {}; // skill -> points allocated
        this.selectedPerk = null;
        this.level = 1;
        this.message = '';
    }

    open(data) {
        this.visible = true;
        this.tab = 0;
        this.cursor = 0;
        this.skillPoints = data.skillPoints;
        this.canPickPerk = data.canPickPerk;
        this.level = data.level;
        this.allocations = {};
        this.selectedPerk = null;
        this.message = '';

        // Initialize allocations for all skills to 0
        for (const skill of skillNames) {
            this.allocations[skill] = 0;
        }
    }

    handleInput(key) {
        if (!this.visible) return false;

        switch (key) {
            case 'Tab':
                this._nextTab();
                return true;
            case 'ArrowUp': case 'k':
                this.cursor = Math.max(0, this.cursor - 1);
                return true;
            case 'ArrowDown': case 'j':
                this._cursorDown();
                return true;
            case 'ArrowRight': case '+': case '=':
                if (this.tab === 0) this._allocatePoint(1);
                return true;
            case 'ArrowLeft': case '-':
                if (this.tab === 0) this._allocatePoint(-1);
                return true;
            case 'Enter': case ' ':
                if (this.tab === 1) this._selectPerk();
                else if (this.tab === 2) this._confirm();
                return true;
        }
        return true; // consume all input while level-up is open
    }

    _nextTab() {
        if (this.tab === 0) {
            if (this.canPickPerk) {
                this.tab = 1;
            } else {
                this.tab = 2;
            }
        } else if (this.tab === 1) {
            this.tab = 2;
        } else {
            this.tab = 0;
        }
        this.cursor = 0;
        this.message = '';
    }

    _cursorDown() {
        if (this.tab === 0) {
            this.cursor = Math.min(skillNames.length - 1, this.cursor + 1);
        } else if (this.tab === 1) {
            const perks = this._getAvailablePerks();
            const locked = this._getLockedPerks();
            this.cursor = Math.min(perks.length + locked.length - 1, Math.max(0, this.cursor + 1));
        }
    }

    _getRemainingPoints() {
        let spent = 0;
        for (const pts of Object.values(this.allocations)) {
            spent += pts;
        }
        return this.skillPoints - spent;
    }

    _allocatePoint(delta) {
        const skill = skillNames[this.cursor];
        if (!skill) return;

        if (delta > 0) {
            if (this._getRemainingPoints() <= 0) {
                this.message = 'No skill points remaining!';
                return;
            }
            this.allocations[skill] = (this.allocations[skill] || 0) + 1;
        } else {
            if ((this.allocations[skill] || 0) <= 0) return;
            this.allocations[skill] -= 1;
        }
        this.message = '';
    }

    _getAvailablePerks() {
        const stats = this.em.get(this.playerId, 'Stats');
        const currentPerks = this.perkSystem.getPerks(this.playerId);
        return PerkDefinitions.getAvailable(stats, currentPerks);
    }

    _getLockedPerks() {
        const stats = this.em.get(this.playerId, 'Stats');
        const currentPerks = this.perkSystem.getPerks(this.playerId);
        const available = PerkDefinitions.getAvailable(stats, currentPerks);
        const availableIds = new Set(available.map(p => p.id));
        return PerkDefinitions.getAll().filter(p => {
            const current = currentPerks[p.id] || 0;
            return current < p.ranks && !availableIds.has(p.id);
        });
    }

    _selectPerk() {
        const perks = this._getAvailablePerks();
        if (this.cursor >= perks.length) return; // cursor is on a locked perk
        this.selectedPerk = perks[this.cursor];
        this.message = `Selected: ${this.selectedPerk.name}`;
    }

    _confirm() {
        // Validate: all skill points must be spent
        if (this._getRemainingPoints() > 0) {
            this.message = `Spend all ${this._getRemainingPoints()} remaining skill points first!`;
            return;
        }

        // Validate: perk must be selected if available
        if (this.canPickPerk && !this.selectedPerk) {
            this.message = 'Select a perk first! (use Tab to go to Perks tab)';
            return;
        }

        // Apply skill points
        this.levelUpSystem.applySkillPoints(this.playerId, this.allocations);

        // Apply perk
        if (this.selectedPerk) {
            this.perkSystem.addPerk(this.playerId, this.selectedPerk.id);
        }

        this.visible = false;
        this.eventBus.emit('levelUpComplete', {});
    }

    render(renderer) {
        if (!this.visible) return;

        const w = 60;
        const h = 28;
        const x = Math.floor((renderer.cols - w) / 2);
        const y = Math.floor((renderer.rows - h) / 2);

        renderer.drawBox(x, y, w, h, Colors.uiBorder, Colors.uiBg);

        // Title
        renderer.drawText(x + 2, y + 1, `LEVEL UP! Level ${this.level}`, Colors.uiHighlight, Colors.uiBg);
        renderer.drawText(x + 2, y + 2, `Skill Points: ${this._getRemainingPoints()}/${this.skillPoints}`, '#ffcc00', Colors.uiBg);

        // Tab bar
        const tabs = ['Skills'];
        if (this.canPickPerk) tabs.push('Perks');
        tabs.push('Confirm');
        let tabX = x + 2;
        for (let i = 0; i < tabs.length; i++) {
            const tabIdx = i === 0 ? 0 : (i === 1 && this.canPickPerk ? 1 : 2);
            const active = this.tab === tabIdx;
            const label = `[${tabs[i]}]`;
            renderer.drawText(tabX, y + 3, label, active ? Colors.uiHighlight : Colors.uiDim, Colors.uiBg);
            tabX += label.length + 2;
        }

        const contentY = y + 5;
        const maxRows = h - 9;

        if (this.tab === 0) {
            this._renderSkillsTab(renderer, x, contentY, w, maxRows);
        } else if (this.tab === 1) {
            this._renderPerksTab(renderer, x, contentY, w, maxRows);
        } else {
            this._renderConfirmTab(renderer, x, contentY, w, maxRows);
        }

        // Message
        if (this.message) {
            renderer.drawText(x + 2, y + h - 3, this.message.substring(0, w - 4), Colors.uiHighlight, Colors.uiBg);
        }

        // Help
        const helpText = this.tab === 0
            ? '[j/k]navigate [+/-]allocate [Tab]next'
            : this.tab === 1
            ? '[j/k]navigate [Enter]select [Tab]next'
            : '[Enter]confirm [Tab]back';
        renderer.drawText(x + 2, y + h - 2, helpText, Colors.uiDim, Colors.uiBg);
    }

    _renderSkillsTab(renderer, x, startY, w, maxRows) {
        const stats = this.em.get(this.playerId, 'Stats');
        if (!stats) return;
        const tagSkills = stats._tagSkills || [];

        for (let i = 0; i < Math.min(skillNames.length, maxRows); i++) {
            const skill = skillNames[i];
            const displayName = skillDisplayNames[skill] || skill;
            const current = stats.skills[skill] || 0;
            const allocated = this.allocations[skill] || 0;
            const isTag = tagSkills.includes(skill);
            const tagMult = isTag ? 2 : 1;
            const effective = current + allocated * tagMult;

            const selected = i === this.cursor;
            const prefix = selected ? '> ' : '  ';
            const fg = selected ? Colors.uiHighlight : Colors.uiText;
            const tagLabel = isTag ? ' (TAG 2x)' : '';

            let line = `${prefix}${displayName}${tagLabel}`;
            line = line.padEnd(28);
            const valStr = allocated > 0 ? `${current} + ${allocated * tagMult} = ${effective}` : `${current}`;
            line += valStr;

            renderer.drawText(x + 2, startY + i, line.substring(0, w - 4), fg, Colors.uiBg);
        }
    }

    _renderPerksTab(renderer, x, startY, w, maxRows) {
        const available = this._getAvailablePerks();
        const locked = this._getLockedPerks();

        let row = 0;
        // Available perks
        for (let i = 0; i < available.length && row < maxRows; i++) {
            const perk = available[i];
            const selected = i === this.cursor;
            const isChosen = this.selectedPerk && this.selectedPerk.id === perk.id;
            const prefix = selected ? '> ' : '  ';
            const marker = isChosen ? ' [SELECTED]' : '';
            const fg = selected ? Colors.uiHighlight : Colors.uiText;

            renderer.drawText(x + 2, startY + row, `${prefix}${perk.name}${marker}`, fg, Colors.uiBg);
            row++;
            if (row < maxRows) {
                renderer.drawText(x + 4, startY + row, perk.description.substring(0, w - 6), Colors.uiDim, Colors.uiBg);
                row++;
            }
        }

        // Locked perks (dimmed)
        if (locked.length > 0 && row < maxRows) {
            row++;
            renderer.drawText(x + 2, startY + row, '--- Locked ---', Colors.uiDim, Colors.uiBg);
            row++;
            for (let i = 0; i < locked.length && row < maxRows; i++) {
                const perk = locked[i];
                const listIdx = available.length + i;
                const selected = listIdx === this.cursor;
                const prefix = selected ? '> ' : '  ';
                let reqStr = `Lv${perk.levelReq}`;
                if (perk.statReq) {
                    const reqs = Object.entries(perk.statReq).map(([s, v]) => `${s.substring(0, 3).toUpperCase()} ${v}`);
                    reqStr += ' ' + reqs.join(' ');
                }
                renderer.drawText(x + 2, startY + row, `${prefix}${perk.name} (${reqStr})`, '#444', Colors.uiBg);
                row++;
            }
        }

        if (available.length === 0 && locked.length === 0) {
            renderer.drawText(x + 2, startY, '  No perks available.', Colors.uiDim, Colors.uiBg);
        }
    }

    _renderConfirmTab(renderer, x, startY, w, maxRows) {
        let row = 0;
        renderer.drawText(x + 2, startY + row, 'SUMMARY', Colors.uiHighlight, Colors.uiBg);
        row += 2;

        // Show allocations
        const stats = this.em.get(this.playerId, 'Stats');
        const tagSkills = stats?._tagSkills || [];
        let hasAllocs = false;
        for (const skill of skillNames) {
            const pts = this.allocations[skill] || 0;
            if (pts > 0) {
                hasAllocs = true;
                const isTag = tagSkills.includes(skill);
                const mult = isTag ? 2 : 1;
                const displayName = skillDisplayNames[skill] || skill;
                const current = stats.skills[skill] || 0;
                renderer.drawText(x + 4, startY + row, `${displayName}: ${current} -> ${current + pts * mult} (+${pts * mult})`, Colors.uiText, Colors.uiBg);
                row++;
                if (row >= maxRows) break;
            }
        }
        if (!hasAllocs) {
            renderer.drawText(x + 4, startY + row, '(no skill points allocated)', Colors.uiDim, Colors.uiBg);
            row++;
        }

        row++;

        // Show selected perk
        if (this.canPickPerk) {
            if (this.selectedPerk) {
                renderer.drawText(x + 2, startY + row, `Perk: ${this.selectedPerk.name}`, '#ffcc00', Colors.uiBg);
                row++;
                renderer.drawText(x + 4, startY + row, this.selectedPerk.description.substring(0, w - 6), Colors.uiDim, Colors.uiBg);
            } else {
                renderer.drawText(x + 2, startY + row, 'Perk: (none selected)', '#f66', Colors.uiBg);
            }
            row++;
        }

        row += 2;
        const remaining = this._getRemainingPoints();
        if (remaining > 0) {
            renderer.drawText(x + 2, startY + row, `WARNING: ${remaining} skill points unspent!`, '#f66', Colors.uiBg);
        } else if (this.canPickPerk && !this.selectedPerk) {
            renderer.drawText(x + 2, startY + row, 'WARNING: No perk selected!', '#f66', Colors.uiBg);
        } else {
            renderer.drawText(x + 2, startY + row, 'Press Enter to confirm.', Colors.uiHighlight, Colors.uiBg);
        }
    }
}
