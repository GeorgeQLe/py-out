export const wastelandOutpost = {
    id: 'wasteland_outpost',
    name: 'Wasteland Outpost',
    transitions: [
        { x: 48, y: 1, targetMap: 'abandoned_vault', arrival: 'default' },
        { x: 48, y: 26, targetMap: 'trading_post', arrival: 'default' },
    ],
    arrivals: {
        default: { x: 20, y: 6 },
    },
    layout: [
        '##################################################',
        '#..............................................>.#',
        '#..%%%...........................................#',
        '#..%%%..........################................#',
        '#...............#..............#.....ooo.........#',
        '#...............#..............#.....ooo.........#',
        '#...............#....@.........+.................#',
        '#...............#..............#.................#',
        '#...............#..............#....####+######..#',
        '#...............#####+#########....#..........#..#',
        '#..................................#..........#..#',
        '#..ooo.............................#..........#..#',
        '#..ooo.............................##+########..#',
        '#................................................#',
        '#....~~~~........................................#',
        '#....~~~~....%%%.................................#',
        '#....~~~~....%%%......#########+########.........#',
        '#.....................#................#.........#',
        '#.....................#................#.........#',
        '#.....................#......o.........#.........#',
        '#.....................#................#.........#',
        '#.....................#................#.........#',
        '#.....................#########+########.........#',
        '#................................................#',
        '#...........ooo..................................#',
        '#...........ooo..................................#',
        '#..............................................>.#',
        '##################################################',
    ].join('\n'),
    entities: [
        {
            x: 40, y: 5,
            renderable: { glyph: 'r', fg: '#ff3333', layer: 2 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: { NPC: { name: 'Raider', hostile: true } }
        },
        {
            x: 42, y: 7,
            renderable: { glyph: 'r', fg: '#ff3333', layer: 2 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: { NPC: { name: 'Raider', hostile: true } }
        },
        {
            x: 14, y: 15,
            renderable: { glyph: 'M', fg: '#ffcc00', layer: 2 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: { NPC: { name: 'Merchant', hostile: false } }
        },
        // Commander Hayes - inside south building
        {
            x: 22, y: 19,
            renderable: { glyph: 'H', fg: '#4488ff', layer: 2 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: { NPC: { name: 'Commander Hayes', hostile: false } }
        },
        // Water purifier
        {
            x: 10, y: 24,
            renderable: { glyph: '&', fg: '#4488ff', layer: 1 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: { Interactable: { type: 'water_purifier', skill: 'repair', difficulty: 35 } }
        },
        // Locked container in east room
        {
            x: 35, y: 10,
            renderable: { glyph: '=', fg: '#aa8833', layer: 1 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: {
                Container: {
                    items: [
                        { id: 'vault_keycard', name: 'Vault Keycard', type: 'quest', glyph: '-', fg: '#ffaa00', weight: 0, quantity: 1 },
                        { id: 'poke_n_heal', name: 'Poke-n-Heal', type: 'consumable', glyph: '!', fg: '#44ff44', weight: 1, stackable: true, quantity: 2, effects: { healHP: 15 } },
                    ],
                    locked: true,
                    lockDifficulty: 30,
                }
            }
        },
        // Open barrel near water
        {
            x: 8, y: 14,
            renderable: { glyph: '0', fg: '#886644', layer: 1 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: {
                Container: {
                    items: [
                        { id: 'nukka_fizz', name: 'Nukka Fizz', type: 'consumable', glyph: '!', fg: '#4488ff', weight: 1, stackable: true, quantity: 2, effects: { healHP: 5, healAP: 2 } },
                        { id: '9mm', name: '9mm Rounds', type: 'ammo', glyph: '=', fg: '#aa8833', weight: 0, stackable: true, quantity: 12 },
                    ],
                    locked: false,
                    lockDifficulty: 0,
                }
            }
        },
    ],
};
