export function Container(items = [], locked = false, lockDifficulty = 0) {
    return {
        items,
        locked,
        lockDifficulty,
    };
}
