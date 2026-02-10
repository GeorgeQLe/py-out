import { weapons } from '../items/weapons.js';

export const enemyTemplates = {
    raider_melee: {
        name: 'Raider Thug',
        glyph: 'r',
        fg: '#ff3333',
        faction: 'raider',
        behavior: 'hostile',
        stats: {
            strength: 6, perception: 4, endurance: 5,
            charisma: 2, intelligence: 3, agility: 5, luck: 4,
            maxHP: 25, hp: 25, maxAP: 7, ap: 7, ac: 5,
            meleeDamage: 3, critChance: 4,
            skills: { melee: 55, smallGuns: 30 },
        },
        weapon: { ...weapons.knife },
    },
    raider_gunner: {
        name: 'Raider Gunner',
        glyph: 'r',
        fg: '#ff4444',
        faction: 'raider',
        behavior: 'hostile',
        stats: {
            strength: 5, perception: 6, endurance: 4,
            charisma: 2, intelligence: 3, agility: 6, luck: 4,
            maxHP: 20, hp: 20, maxAP: 8, ap: 8, ac: 3,
            meleeDamage: 1, critChance: 5,
            skills: { melee: 30, smallGuns: 55 },
        },
        weapon: { ...weapons.pipe_pistol },
    },
    raider_boss: {
        name: 'Raider Boss',
        glyph: 'R',
        fg: '#ff0000',
        faction: 'raider',
        behavior: 'hostile',
        stats: {
            strength: 7, perception: 6, endurance: 7,
            charisma: 4, intelligence: 4, agility: 6, luck: 5,
            maxHP: 45, hp: 45, maxAP: 8, ap: 8, ac: 10,
            meleeDamage: 4, critChance: 8,
            skills: { melee: 60, smallGuns: 70 },
        },
        weapon: { ...weapons.combat_shotgun },
    },
    mutant_brute: {
        name: 'Mutant Brute',
        glyph: 'M',
        fg: '#88ff44',
        faction: 'mutant',
        behavior: 'hostile',
        stats: {
            strength: 9, perception: 3, endurance: 9,
            charisma: 1, intelligence: 2, agility: 3, luck: 3,
            maxHP: 60, hp: 60, maxAP: 6, ap: 6, ac: 5,
            meleeDamage: 8, critChance: 3,
            skills: { melee: 70, smallGuns: 20 },
        },
        weapon: null,
    },
};
