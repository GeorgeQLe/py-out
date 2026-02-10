import { Colors } from '../render/Colors.js';

export class DialoguePanel {
    constructor(dialogueEngine, eventBus) {
        this.engine = dialogueEngine;
        this.eventBus = eventBus;
        this.visible = false;
        this.cursor = 0;
        this.npcName = '';
    }

    open(npcName) {
        this.visible = true;
        this.cursor = 0;
        this.npcName = npcName;
    }

    close() {
        this.visible = false;
        this.engine.end();
        this.eventBus.emit('dialogueEnded', {});
    }

    handleInput(key) {
        if (!this.visible) return false;

        const node = this.engine.getCurrentNode();
        if (!node) {
            this.close();
            return true;
        }

        const selectableResponses = node.responses.filter(r => r.available);

        switch (key) {
            case 'ArrowUp': case 'k':
                this.cursor = Math.max(0, this.cursor - 1);
                return true;
            case 'ArrowDown': case 'j':
                this.cursor = Math.min(node.responses.length - 1, this.cursor + 1);
                return true;
            case 'Enter': case ' ': {
                const response = node.responses[this.cursor];
                if (!response || !response.available) return true;

                const realIndex = this.cursor;
                const nextNode = this.engine.selectResponse(realIndex);
                this.cursor = 0;

                if (!nextNode) {
                    this.close();
                }
                return true;
            }
            case 'Escape':
                this.close();
                return true;
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9': {
                const idx = parseInt(key) - 1;
                if (idx < node.responses.length && node.responses[idx].available) {
                    const nextNode = this.engine.selectResponse(idx);
                    this.cursor = 0;
                    if (!nextNode) this.close();
                }
                return true;
            }
        }
        return true;
    }

    render(renderer) {
        if (!this.visible) return;

        const node = this.engine.getCurrentNode();
        if (!node) return;

        const w = Math.min(70, renderer.cols - 4);
        const h = Math.min(20, renderer.rows - 4);
        const x = Math.floor((renderer.cols - w) / 2);
        const y = renderer.rows - h - 2;

        renderer.drawBox(x, y, w, h, Colors.uiBorder, Colors.uiBg);

        // NPC name
        renderer.drawText(x + 2, y + 1, this.npcName, Colors.npc, Colors.uiBg);

        // NPC text (word-wrap)
        const maxTextWidth = w - 4;
        const lines = this._wordWrap(node.text, maxTextWidth);
        for (let i = 0; i < lines.length && i < 5; i++) {
            renderer.drawText(x + 2, y + 3 + i, lines[i], Colors.uiText, Colors.uiBg);
        }

        // Responses
        const responseY = y + 3 + Math.min(lines.length, 5) + 1;
        for (let i = 0; i < node.responses.length; i++) {
            const r = node.responses[i];
            const selected = i === this.cursor;
            const num = `${i + 1}. `;
            const label = r.conditionLabel ? `${r.conditionLabel} ` : '';

            let fg;
            if (!r.available) {
                fg = '#553333'; // Grayed out unavailable
            } else if (selected) {
                fg = Colors.uiHighlight;
            } else {
                fg = Colors.uiText;
            }

            const prefix = selected ? '> ' : '  ';
            const text = `${prefix}${num}${label}${r.text}`;
            renderer.drawText(x + 2, responseY + i, text.substring(0, w - 4), fg, Colors.uiBg);
        }
    }

    _wordWrap(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let current = '';

        for (const word of words) {
            if (current.length + word.length + 1 > maxWidth) {
                lines.push(current);
                current = word;
            } else {
                current = current ? current + ' ' + word : word;
            }
        }
        if (current) lines.push(current);
        return lines;
    }
}
