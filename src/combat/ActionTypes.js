export const ActionTypes = {
    MOVE: { name: 'Move', apCost: 1 },
    SINGLE_SHOT: { name: 'Single Shot', apCost: 4 },
    AIMED_SHOT: { name: 'Aimed Shot', apCost: 5 },
    BURST: { name: 'Burst', apCost: 6 },
    RELOAD: { name: 'Reload', apCost: 2 },
    USE_ITEM: { name: 'Use Item', apCost: 2 },
    MELEE: { name: 'Melee', apCost: 3 },
    OVERWATCH: { name: 'Overwatch', apCost: 0 }, // uses remaining AP
    END_TURN: { name: 'End Turn', apCost: 0 },
};
