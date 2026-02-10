export const npcDefinitions = {
    merchant: {
        id: 'merchant',
        name: 'Dusty the Merchant',
        glyph: 'M',
        fg: '#ffcc00',
        dialogueId: 'merchant',
        faction: 'neutral',
        inventory: [
            { id: 'stimpak', name: 'Stimpak', type: 'consumable', glyph: '!', fg: '#44ff44', weight: 1, stackable: true, quantity: 3, effects: { healHP: 15 }, price: 50 },
            { id: 'leather_armor', name: 'Leather Armor', type: 'armor', glyph: '[', fg: '#6a4a2a', weight: 8, dt: 4, dr: 25, acBonus: 5, price: 200 },
            { id: '9mm', name: '9mm Rounds', type: 'ammo', glyph: '=', fg: '#aa8833', weight: 0, stackable: true, quantity: 48, price: 20 },
        ],
    },
    commander_hayes: {
        id: 'commander_hayes',
        name: 'Commander Hayes',
        glyph: 'H',
        fg: '#4488ff',
        dialogueId: 'quest_giver',
        faction: 'neutral',
        questIds: ['clear_raiders', 'find_vault', 'fix_purifier'],
    },
};
