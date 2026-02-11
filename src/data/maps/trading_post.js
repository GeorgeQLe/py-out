export const tradingPost = {
    id: 'trading_post',
    name: 'Trading Post',
    transitions: [
        { x: 1, y: 1, targetMap: 'wasteland_outpost', arrival: 'default' },
    ],
    arrivals: {
        default: { x: 7, y: 5 },
    },
    layout: [
        '########################################',
        '#>....................................#',
        '#..#####+#####.........................#',
        '#..#...........#.........................#',
        '#..#...........#.........................#',
        '#..#....@......+.........................#',
        '#..#...........#.........................#',
        '#..#####+#####.........................#',
        '#......................................#',
        '#.....ooo..............................#',
        '#.....ooo..............................#',
        '#......................................#',
        '#..#####+#####.........................#',
        '#..#...........#..........ooo...........#',
        '#..#...........#..........ooo...........#',
        '#..#...........+.........................#',
        '#..#...........#.........................#',
        '#..#####+#####.........................#',
        '#......................................#',
        '#......................................#',
        '########################################',
    ].join('\n'),
    entities: [
        {
            x: 20, y: 5,
            renderable: { glyph: 'M', fg: '#ffcc00', layer: 2 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: { NPC: { name: 'Trader', hostile: false } },
        },
        // Supply crate
        {
            x: 8, y: 14,
            renderable: { glyph: '=', fg: '#aa8833', layer: 1 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: {
                Container: {
                    items: [
                        { id: 'poke_n_heal', name: 'Poke-n-Heal', type: 'consumable', glyph: '!', fg: '#44ff44', weight: 1, stackable: true, quantity: 2, effects: { healHP: 15 } },
                        { id: '10mm', name: '10mm Rounds', type: 'ammo', glyph: '=', fg: '#aa8833', weight: 0, stackable: true, quantity: 24 },
                    ],
                    locked: false,
                    lockDifficulty: 0,
                }
            },
        },
        // Guard NPC
        {
            x: 25, y: 10,
            renderable: { glyph: 'g', fg: '#4488ff', layer: 2 },
            blocker: { blocksMove: true, blocksSight: false },
            tags: { NPC: { name: 'Guard', hostile: false } },
        },
    ],
};
