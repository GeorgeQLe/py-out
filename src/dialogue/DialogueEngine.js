export class DialogueEngine {
    constructor(conditions, effects) {
        this.conditions = conditions;
        this.effects = effects;
        this.currentTree = null;
        this.currentNodeId = null;
        this.playerId = null;
        this.npcId = null;
        this.active = false;
    }

    start(dialogueTree, playerId, npcId) {
        this.currentTree = dialogueTree;
        this.currentNodeId = dialogueTree.startNode || 'start';
        this.playerId = playerId;
        this.npcId = npcId;
        this.active = true;
        return this.getCurrentNode();
    }

    getCurrentNode() {
        if (!this.currentTree || !this.currentNodeId) return null;
        const node = this.currentTree.nodes[this.currentNodeId];
        if (!node) return null;

        // Filter responses based on conditions
        const availableResponses = (node.responses || []).map(response => {
            let available = true;
            let conditionLabel = '';

            if (response.condition) {
                available = this.conditions.check(response.condition, this.playerId);
                conditionLabel = this.conditions.getConditionLabel(response.condition);
            }

            return {
                ...response,
                available,
                conditionLabel,
            };
        });

        return {
            ...node,
            responses: availableResponses,
        };
    }

    selectResponse(responseIndex) {
        const node = this.getCurrentNode();
        if (!node || !node.responses[responseIndex]) return null;

        const response = node.responses[responseIndex];

        // Must be available (unless it's shown grayed out and you can't select)
        if (!response.available) return null;

        // Apply effects
        if (response.effects) {
            for (const effect of response.effects) {
                this.effects.apply(effect, this.playerId, this.npcId);
            }
        }

        // Apply node-level effects too
        if (response.onSelect) {
            for (const effect of response.onSelect) {
                this.effects.apply(effect, this.playerId, this.npcId);
            }
        }

        // Navigate to next node
        if (response.next === 'end' || !response.next) {
            this.end();
            return null;
        }

        this.currentNodeId = response.next;
        return this.getCurrentNode();
    }

    end() {
        this.active = false;
        this.currentTree = null;
        this.currentNodeId = null;
    }
}
