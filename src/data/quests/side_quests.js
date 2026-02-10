export const sideQuests = [
    {
        id: 'clear_raiders',
        name: 'Clear the Raider Camp',
        description: 'Eliminate the raiders threatening the outpost.',
        xpReward: 500,
        objectives: [
            {
                type: 'kill',
                description: 'Kill the raiders',
                target: 3,
                targetFaction: 'raider',
            },
        ],
    },
    {
        id: 'delivery_run',
        name: 'Delivery Run',
        description: 'Deliver the sealed package to the trading post.',
        xpReward: 200,
        objectives: [
            {
                type: 'reachLocation',
                description: 'Deliver the package to the trading post',
                target: 1,
                targetX: 25,
                targetY: 14,
                mapId: 'trading_post',
            },
        ],
    },
    {
        id: 'fix_purifier',
        name: 'Fix the Water Purifier',
        description: 'Repair the broken water purifier in the outpost basement.',
        xpReward: 300,
        objectives: [
            {
                type: 'skillUse',
                description: 'Repair the water purifier (Repair 35)',
                target: 1,
                skill: 'repair',
                difficulty: 35,
            },
        ],
    },
];
