import { Colors } from '../render/Colors.js';

export class MainMenu {
    constructor(eventBus, saveLoad) {
        this.eventBus = eventBus;
        this.saveLoad = saveLoad;
        this.visible = true;
        this.cursor = 0;
        this.options = ['New Game', 'Continue', 'Controls', 'About'];
        this.showingControls = false;
        this.showingAbout = false;
    }

    handleInput(key) {
        if (!this.visible) return false;

        if (this.showingControls || this.showingAbout) {
            if (key === 'Escape' || key === 'Enter') {
                this.showingControls = false;
                this.showingAbout = false;
            }
            return true;
        }

        switch (key) {
            case 'ArrowUp': case 'k':
                this.cursor = (this.cursor - 1 + this.options.length) % this.options.length;
                return true;
            case 'ArrowDown': case 'j':
                this.cursor = (this.cursor + 1) % this.options.length;
                return true;
            case 'Enter': case ' ':
                this._select();
                return true;
        }
        return true;
    }

    _select() {
        switch (this.options[this.cursor]) {
            case 'New Game':
                this.visible = false;
                this.eventBus.emit('newGame', {});
                break;
            case 'Continue':
                if (this.saveLoad && this.saveLoad.hasSave()) {
                    this.visible = false;
                    this.eventBus.emit('loadGame', { slot: 'auto' });
                }
                break;
            case 'Controls':
                this.showingControls = true;
                break;
            case 'About':
                this.showingAbout = true;
                break;
        }
    }

    render(renderer) {
        if (!this.visible) return;

        renderer.clear();

        const cx = Math.floor(renderer.cols / 2);
        const cy = Math.floor(renderer.rows / 2);

        // Title
        const title = [
            ' __      __              __         .__                    .___',
            '/  \\    /  \\____    _____/  |_  ____ |  | _____    ____    __| _/',
            '\\   \\/\\/   /\\__ \\  /  _/\\   __\\/ __ \\|  | \\__  \\  /    \\  / __ |',
            ' \\        /  / __ \\_\\_  \\ |  | \\  ___/|  |__/ __ \\|   |  \\/ /_/ |',
            '  \\__/\\  /  (____  /___  /|__|  \\___  >____(____  /___|  /\\____ |',
            '       \\/        \\/    \\/            \\/          \\/     \\/      \\/',
        ];

        const titleStartY = cy - 12;
        for (let i = 0; i < title.length; i++) {
            const startX = Math.floor((renderer.cols - title[i].length) / 2);
            renderer.drawText(Math.max(0, startX), titleStartY + i, title[i], Colors.uiText);
        }

        renderer.drawText(cx - 5, titleStartY + 7, 'P R O T O C O L', Colors.uiHighlight);

        // Menu options
        const menuY = cy - 1;
        for (let i = 0; i < this.options.length; i++) {
            const selected = i === this.cursor;
            const prefix = selected ? '> ' : '  ';
            let fg = selected ? Colors.uiHighlight : Colors.uiText;

            let label = this.options[i];
            if (label === 'Continue' && (!this.saveLoad || !this.saveLoad.hasSave())) {
                fg = Colors.uiDim;
                label += ' (no save)';
            }

            renderer.drawText(cx - 10, menuY + i * 2, `${prefix}${label}`, fg);
        }

        // Footer
        renderer.drawText(cx - 18, renderer.rows - 3, 'A post-apocalyptic tactical RPG', Colors.uiDim);
        renderer.drawText(cx - 12, renderer.rows - 2, 'Arrow keys + Enter to select', Colors.uiDim);

        if (this.showingControls) {
            this._renderControls(renderer, cx, cy);
        }

        if (this.showingAbout) {
            this._renderAbout(renderer, cx, cy);
        }
    }

    _renderControls(renderer, cx, cy) {
        const w = 45;
        const h = 18;
        const x = cx - Math.floor(w / 2);
        const y = cy - Math.floor(h / 2);

        renderer.drawBox(x, y, w, h, Colors.uiBorder, Colors.uiBg);
        renderer.drawText(x + 2, y + 1, 'CONTROLS', Colors.uiHighlight, Colors.uiBg);

        const controls = [
            'Movement:  hjkl / Arrow Keys / Numpad',
            'Diagonals: yubn / 7 9 1 3',
            'Wait:      . or 5',
            '',
            'Combat:',
            '  [f]    Fire weapon at target',
            '  [a]    Aimed shot (body parts)',
            '  [m]    Melee attack',
            '  [o]    Overwatch',
            '  [Space] End turn',
            '',
            'Other:',
            '  [i] Inventory  [c] Character',
            '  [q] Quest log  [?] Help',
        ];

        for (let i = 0; i < controls.length; i++) {
            renderer.drawText(x + 2, y + 3 + i, controls[i], Colors.uiText, Colors.uiBg);
        }
    }

    _renderAbout(renderer, cx, cy) {
        const w = 40;
        const h = 8;
        const x = cx - Math.floor(w / 2);
        const y = cy - Math.floor(h / 2);

        renderer.drawBox(x, y, w, h, Colors.uiBorder, Colors.uiBg);
        renderer.drawText(x + 2, y + 1, 'WASTELAND PROTOCOL', Colors.uiHighlight, Colors.uiBg);
        renderer.drawText(x + 2, y + 3, 'ASCII Tactical RPG', Colors.uiText, Colors.uiBg);
        renderer.drawText(x + 2, y + 4, 'Fallout meets XCOM in a terminal', Colors.uiDim, Colors.uiBg);
        renderer.drawText(x + 2, y + 6, '[Esc] Back', Colors.uiDim, Colors.uiBg);
    }
}
