// XP thresholds by level (xp needed to reach this level)
export const xpTable = [];
for (let i = 0; i <= 30; i++) {
    xpTable[i] = i * (i - 1) * 500;
}

export const skillNames = [
    'smallGuns', 'bigGuns', 'energyWeapons', 'melee', 'throwing',
    'doctor', 'firstAid', 'sneak', 'lockpick', 'steal',
    'traps', 'science', 'repair', 'speech', 'barter',
    'gambling', 'outdoorsman',
];

export const skillDisplayNames = {
    smallGuns: 'Small Guns',
    bigGuns: 'Big Guns',
    energyWeapons: 'Energy Weapons',
    melee: 'Melee',
    throwing: 'Throwing',
    doctor: 'Doctor',
    firstAid: 'First Aid',
    sneak: 'Sneak',
    lockpick: 'Lockpick',
    steal: 'Steal',
    traps: 'Traps',
    science: 'Science',
    repair: 'Repair',
    speech: 'Speech',
    barter: 'Barter',
    gambling: 'Gambling',
    outdoorsman: 'Outdoorsman',
};

export const specialNames = [
    'strength', 'perception', 'endurance', 'charisma',
    'intelligence', 'agility', 'luck',
];

export const specialDisplayNames = {
    strength: 'Strength',
    perception: 'Perception',
    endurance: 'Endurance',
    charisma: 'Charisma',
    intelligence: 'Intelligence',
    agility: 'Agility',
    luck: 'Luck',
};
