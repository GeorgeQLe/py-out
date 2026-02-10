import { Colors } from '../render/Colors.js';
import { QuestState } from '../quest/QuestManager.js';

export class QuestLog {
    constructor(questManager) {
        this.qm = questManager;
        this.visible = false;
        this.cursor = 0;
    }

    toggle() {
        this.visible = !this.visible;
        this.cursor = 0;
    }

    handleInput(key) {
        if (!this.visible) return false;

        const quests = this.qm.getAllQuests();
        switch (key) {
            case 'ArrowUp': case 'k':
                this.cursor = Math.max(0, this.cursor - 1);
                return true;
            case 'ArrowDown': case 'j':
                this.cursor = Math.min(quests.length - 1, this.cursor + 1);
                return true;
            case 'q': case 'Escape':
                this.visible = false;
                return true;
        }
        return true;
    }

    render(renderer) {
        if (!this.visible) return;

        const quests = this.qm.getAllQuests();
        const w = 55;
        const h = Math.min(24, quests.length * 4 + 6);
        const x = Math.floor((renderer.cols - w) / 2);
        const y = Math.floor((renderer.rows - h) / 2);

        renderer.drawBox(x, y, w, h, Colors.uiBorder, Colors.uiBg);
        renderer.drawText(x + 2, y + 1, 'QUEST LOG', Colors.uiHighlight, Colors.uiBg);

        if (quests.length === 0) {
            renderer.drawText(x + 2, y + 3, 'No quests yet.', Colors.uiDim, Colors.uiBg);
        }

        let row = y + 3;
        for (let i = 0; i < quests.length; i++) {
            const quest = quests[i];
            const selected = i === this.cursor;
            const prefix = selected ? '> ' : '  ';

            let stateColor;
            let stateStr;
            switch (quest.state) {
                case QuestState.ACTIVE:
                    stateColor = Colors.uiText;
                    stateStr = '[ACTIVE]';
                    break;
                case QuestState.COMPLETED:
                    stateColor = '#44ff44';
                    stateStr = '[DONE]';
                    break;
                case QuestState.FAILED:
                    stateColor = '#ff4444';
                    stateStr = '[FAILED]';
                    break;
                default:
                    stateColor = Colors.uiDim;
                    stateStr = '';
            }

            const fg = selected ? Colors.uiHighlight : stateColor;
            renderer.drawText(x + 2, row, `${prefix}${quest.definition.name} ${stateStr}`, fg, Colors.uiBg);
            row++;

            if (selected && quest.state === QuestState.ACTIVE) {
                for (const obj of quest.objectives) {
                    const check = obj.completed ? '[x]' : '[ ]';
                    const progress = obj.target > 1 ? ` (${obj.current}/${obj.target})` : '';
                    renderer.drawText(x + 6, row, `${check} ${obj.description}${progress}`, Colors.uiDim, Colors.uiBg);
                    row++;
                }
            }
            row++;
        }

        renderer.drawText(x + 2, y + h - 2, '[j/k]navigate [q/Esc]close', Colors.uiDim, Colors.uiBg);
    }
}
