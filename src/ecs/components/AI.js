export function AI(behavior = 'hostile') {
    return {
        behavior,     // 'hostile', 'defensive', 'passive'
        alertLevel: 0, // 0=unaware, 1=suspicious, 2=hostile
        lastKnownPlayerX: -1,
        lastKnownPlayerY: -1,
    };
}
