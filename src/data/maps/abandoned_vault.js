export const abandonedVault = {
    id: 'abandoned_vault',
    name: 'Abandoned Vault',
    transitions: [
        { x: 1, y: 1, targetMap: 'wasteland_outpost', arrival: 'default' },
    ],
    arrivals: {
        default: { x: 20, y: 5 },
    },
    layout: [
        '########################################',
        '#>....................................#',
        '#..#####+#####..#####+#####............#',
        '#..#...........##...........#...........#',
        '#..#...........##...........#...........#',
        '#..#...........+....@.......#...........#',
        '#..#...........##...........#...........#',
        '#..#####+#####..#####+#####............#',
        '#......................................#',
        '#..ooo.................................#',
        '#.................#####+####............#',
        '#.................#........#............#',
        '#.................#..oo....#............#',
        '#.................#........#............#',
        '#.................#........#............#',
        '#.................#####+####............#',
        '#......................................#',
        '#..%%%.................................#',
        '#..%%%.................................#',
        '#......................................#',
        '########################################',
    ].join('\n'),
    entities: [
        {
            x: 8, y: 5,
            renderable: { glyph: 'T', fg: '#4488ff', layer: 2 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: { NPC: { name: 'Terminal', hostile: false } },
        },
        // Mutant Brutes
        {
            x: 25, y: 9,
            renderable: { glyph: 'M', fg: '#88ff44', layer: 2 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: { NPC: { name: 'Mutant Brute', hostile: true } },
        },
        {
            x: 30, y: 14,
            renderable: { glyph: 'M', fg: '#88ff44', layer: 2 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: { NPC: { name: 'Mutant Brute', hostile: true } },
        },
        // Medical locker
        {
            x: 10, y: 12,
            renderable: { glyph: '=', fg: '#44ff44', layer: 1 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: {
                Container: {
                    items: [
                        { id: 'poke_n_heal', name: 'Poke-n-Heal', type: 'consumable', glyph: '!', fg: '#44ff44', weight: 1, stackable: true, quantity: 3, effects: { healHP: 15 } },
                        { id: 'super_poke_n_heal', name: 'Super Poke-n-Heal', type: 'consumable', glyph: '!', fg: '#22ff88', weight: 1, stackable: true, quantity: 1, effects: { healHP: 40 } },
                        { id: 'glow_b_gone', name: 'Glow-B-Gone', type: 'consumable', glyph: '!', fg: '#ff8800', weight: 1, stackable: true, quantity: 1, effects: { healRads: 50 } },
                    ],
                    locked: false,
                    lockDifficulty: 0,
                }
            },
        },
        // Armory crate
        {
            x: 32, y: 4,
            renderable: { glyph: '=', fg: '#aa8833', layer: 1 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: {
                Container: {
                    items: [
                        { id: 'combat_armor', name: 'Combat Armor', type: 'armor', glyph: '[', fg: '#5a7a5a', weight: 12, dt: 10, dr: 40, acBonus: 10, quantity: 1 },
                        { id: '.308', name: '.308 Rounds', type: 'ammo', glyph: '=', fg: '#aa8833', weight: 0, stackable: true, quantity: 10 },
                    ],
                    locked: false,
                    lockDifficulty: 0,
                }
            },
        },
        // Floor loot - Brain Bitz
        {
            x: 20, y: 17,
            renderable: { glyph: '!', fg: '#ff66ff', layer: 1 },
            blocker: { blocksMove: false, blocksSight: false },
            tags: {
                Item: { id: 'brain_bitz', name: 'Brain Bitz', type: 'consumable', glyph: '!', fg: '#ff66ff', weight: 0, stackable: true, quantity: 1, effects: { buff: { type: 'brain_bitz', duration: 10, strength: 2 } } }
            },
        },
    ],
};
