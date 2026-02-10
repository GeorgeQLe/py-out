export function Faction(id = 'neutral') {
    return { id };
}

export const Factions = {
    PLAYER: 'player',
    RAIDER: 'raider',
    NEUTRAL: 'neutral',
    MUTANT: 'mutant',
};

// Returns true if factions are hostile to each other
export function isHostile(factionA, factionB) {
    if (factionA === factionB) return false;
    if (factionA === Factions.PLAYER && factionB === Factions.RAIDER) return true;
    if (factionA === Factions.RAIDER && factionB === Factions.PLAYER) return true;
    if (factionA === Factions.PLAYER && factionB === Factions.MUTANT) return true;
    if (factionA === Factions.MUTANT && factionB === Factions.PLAYER) return true;
    if (factionA === Factions.RAIDER && factionB === Factions.MUTANT) return true;
    if (factionA === Factions.MUTANT && factionB === Factions.RAIDER) return true;
    return false;
}
