export class UIManager {
    constructor(renderer, eventBus) {
        this.renderer = renderer;
        this.eventBus = eventBus;
        this.panels = [];
    }

    addPanel(panel) {
        this.panels.push(panel);
    }

    removePanel(panel) {
        const idx = this.panels.indexOf(panel);
        if (idx !== -1) this.panels.splice(idx, 1);
    }

    render() {
        for (const panel of this.panels) {
            if (panel.visible) panel.render(this.renderer);
        }
    }

    handleInput(key) {
        // Top panel gets input first
        for (let i = this.panels.length - 1; i >= 0; i--) {
            if (this.panels[i].visible && this.panels[i].handleInput) {
                if (this.panels[i].handleInput(key)) return true;
            }
        }
        return false;
    }
}
