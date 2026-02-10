import { Colors } from '../render/Colors.js';
import { CharacterCreation } from '../rpg/CharacterCreation.js';
import { DerivedStats } from '../rpg/DerivedStats.js';
import { specialNames, specialDisplayNames, skillNames, skillDisplayNames } from '../data/tables.js';
import { TraitDefinitions } from '../rpg/TraitDefinitions.js';

export class CharCreationUI {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.visible = false;
        this.charCreate = new CharacterCreation();
        this.cursor = 0;       // index in current tab
        this.tab = 0;          // 0=SPECIAL, 1=tag skills, 2=traits, 3=confirm
        this.nameEditing = false;
    }

    open() {
        this.visible = true;
        this.charCreate = new CharacterCreation();
        this.cursor = 0;
        this.tab = 0;
    }

    handleInput(key) {
        if (!this.visible) return false;

        if (this.nameEditing) {
            if (key === 'Enter') {
                this.nameEditing = false;
            } else if (key === 'Backspace') {
                this.charCreate.name = this.charCreate.name.slice(0, -1);
            } else if (key.length === 1) {
                this.charCreate.name += key;
            }
            return true;
        }

        switch (key) {
            case 'ArrowUp': case 'k':
                this.cursor = Math.max(0, this.cursor - 1);
                return true;
            case 'ArrowDown': case 'j':
                this._moveCursorDown();
                return true;
            case 'ArrowRight': case 'l': case '+': case '=':
                this._increase();
                return true;
            case 'ArrowLeft': case 'h': case '-':
                this._decrease();
                return true;
            case 'Enter': case ' ':
                this._select();
                return true;
            case 'Tab':
                this.tab = (this.tab + 1) % 4;
                this.cursor = 0;
                return true;
            case 'N': case 'n':
                if (this.tab === 0) {
                    this.nameEditing = true;
                    this.charCreate.name = '';
                }
                return true;
            case 'Escape':
                this.visible = false;
                this.eventBus.emit('charCreationCancelled', {});
                return true;
        }
        return false;
    }

    _moveCursorDown() {
        if (this.tab === 0) this.cursor = Math.min(specialNames.length - 1, this.cursor + 1);
        else if (this.tab === 1) this.cursor = Math.min(skillNames.length - 1, this.cursor + 1);
        else if (this.tab === 2) this.cursor = Math.min(TraitDefinitions.getAll().length - 1, this.cursor + 1);
    }

    _increase() {
        if (this.tab === 0) {
            this.charCreate.increaseStat(specialNames[this.cursor]);
        }
    }

    _decrease() {
        if (this.tab === 0) {
            this.charCreate.decreaseStat(specialNames[this.cursor]);
        }
    }

    _select() {
        if (this.tab === 1) {
            this.charCreate.toggleTagSkill(skillNames[this.cursor]);
        } else if (this.tab === 2) {
            const allTraits = TraitDefinitions.getAll();
            this.charCreate.toggleTrait(allTraits[this.cursor].id);
        } else if (this.tab === 3) {
            // Confirm
            const result = this.charCreate.finalize();
            this.visible = false;
            this.eventBus.emit('charCreationComplete', result);
        }
    }

    render(renderer) {
        if (!this.visible) return;

        const w = 70;
        const h = 30;
        const x = Math.floor((renderer.cols - w) / 2);
        const y = Math.floor((renderer.rows - h) / 2);

        renderer.drawBox(x, y, w, h, Colors.uiBorder, Colors.uiBg);
        renderer.drawText(x + 2, y + 1, 'CHARACTER CREATION', Colors.uiHighlight, Colors.uiBg);
        renderer.drawText(x + 2, y + 2, `Name: ${this.charCreate.name}  (press N to change)`, Colors.uiText, Colors.uiBg);

        // Tabs
        const tabs = ['[S.P.E.C.I.A.L.]', '[Tag Skills]', '[Traits]', '[Confirm]'];
        let tx = x + 2;
        for (let i = 0; i < tabs.length; i++) {
            const fg = i === this.tab ? Colors.uiHighlight : Colors.uiDim;
            renderer.drawText(tx, y + 3, tabs[i], fg, Colors.uiBg);
            tx += tabs[i].length + 2;
        }

        const contentY = y + 5;
        const contentX = x + 3;

        if (this.tab === 0) {
            renderer.drawText(contentX, contentY, `Points remaining: ${this.charCreate.pointsRemaining}`, Colors.uiText, Colors.uiBg);
            for (let i = 0; i < specialNames.length; i++) {
                const name = specialDisplayNames[specialNames[i]];
                const value = this.charCreate.special[specialNames[i]];
                const selected = i === this.cursor;
                const prefix = selected ? '> ' : '  ';
                const fg = selected ? Colors.uiHighlight : Colors.uiText;
                const bar = '='.repeat(value) + '-'.repeat(10 - value);
                renderer.drawText(contentX, contentY + 2 + i, `${prefix}${name.padEnd(14)} ${value.toString().padStart(2)} [${bar}]`, fg, Colors.uiBg);
            }

            // Preview derived stats
            const preview = { ...this.charCreate.special, level: 1 };
            DerivedStats.compute(preview);
            renderer.drawText(contentX + 40, contentY + 2, 'DERIVED:', Colors.uiDim, Colors.uiBg);
            renderer.drawText(contentX + 40, contentY + 3, `Max HP: ${preview.maxHP}`, Colors.uiDim, Colors.uiBg);
            renderer.drawText(contentX + 40, contentY + 4, `Max AP: ${preview.maxAP}`, Colors.uiDim, Colors.uiBg);
            renderer.drawText(contentX + 40, contentY + 5, `AC: ${preview.ac}`, Colors.uiDim, Colors.uiBg);
            renderer.drawText(contentX + 40, contentY + 6, `Crit%: ${preview.critChance}`, Colors.uiDim, Colors.uiBg);
            renderer.drawText(contentX + 40, contentY + 7, `Melee: ${preview.meleeDamage}`, Colors.uiDim, Colors.uiBg);
        }

        if (this.tab === 1) {
            renderer.drawText(contentX, contentY, `Tag Skills: ${this.charCreate.tagSkills.size}/${this.charCreate.maxTagSkills} (Enter to toggle)`, Colors.uiText, Colors.uiBg);
            for (let i = 0; i < skillNames.length; i++) {
                const skill = skillNames[i];
                const name = skillDisplayNames[skill];
                const tagged = this.charCreate.tagSkills.has(skill);
                const selected = i === this.cursor;
                const prefix = selected ? '> ' : '  ';
                const tag = tagged ? ' [TAG]' : '';
                const fg = tagged ? Colors.uiHighlight : (selected ? Colors.uiText : Colors.uiDim);
                renderer.drawText(contentX, contentY + 2 + i, `${prefix}${name.padEnd(16)}${tag}`, fg, Colors.uiBg);
            }
        }

        if (this.tab === 2) {
            renderer.drawText(contentX, contentY, `Traits: ${this.charCreate.selectedTraits.size}/${this.charCreate.maxTraits} (Enter to toggle)`, Colors.uiText, Colors.uiBg);
            const allTraits = TraitDefinitions.getAll();
            for (let i = 0; i < allTraits.length; i++) {
                const trait = allTraits[i];
                const selected = i === this.cursor;
                const picked = this.charCreate.selectedTraits.has(trait.id);
                const prefix = selected ? '> ' : '  ';
                const mark = picked ? '[*] ' : '[ ] ';
                const fg = picked ? Colors.uiHighlight : (selected ? Colors.uiText : Colors.uiDim);
                renderer.drawText(contentX, contentY + 2 + i * 2, `${prefix}${mark}${trait.name}`, fg, Colors.uiBg);
                renderer.drawText(contentX + 4, contentY + 3 + i * 2, trait.description, Colors.uiDim, Colors.uiBg);
            }
        }

        if (this.tab === 3) {
            renderer.drawText(contentX, contentY, 'Press ENTER to begin your journey...', Colors.uiHighlight, Colors.uiBg);
            renderer.drawText(contentX, contentY + 2, `Name: ${this.charCreate.name}`, Colors.uiText, Colors.uiBg);
            const sp = this.charCreate.special;
            renderer.drawText(contentX, contentY + 3, `S:${sp.strength} P:${sp.perception} E:${sp.endurance} C:${sp.charisma} I:${sp.intelligence} A:${sp.agility} L:${sp.luck}`, Colors.uiText, Colors.uiBg);
            renderer.drawText(contentX, contentY + 5, `Tags: ${[...this.charCreate.tagSkills].join(', ') || 'None'}`, Colors.uiText, Colors.uiBg);
            renderer.drawText(contentX, contentY + 6, `Traits: ${[...this.charCreate.selectedTraits].join(', ') || 'None'}`, Colors.uiText, Colors.uiBg);
        }

        renderer.drawText(x + 2, y + h - 2, '[Tab]switch section [Arrows/+-]adjust [Enter]select [Esc]cancel', Colors.uiDim, Colors.uiBg);
    }
}
