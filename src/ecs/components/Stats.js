export function Stats({
    // S.P.E.C.I.A.L.
    strength = 5,
    perception = 5,
    endurance = 5,
    charisma = 5,
    intelligence = 5,
    agility = 5,
    luck = 5,
    // Derived (computed by DerivedStats later, defaults here for early use)
    maxHP = 30,
    hp = 30,
    maxAP = 7,
    ap = 7,
    ac = 0,
    meleeDamage = 1,
    critChance = 5,
    // Skills (base values)
    skills = {},
    // XP & Level
    level = 1,
    xp = 0,
} = {}) {
    return {
        strength, perception, endurance, charisma, intelligence, agility, luck,
        maxHP, hp, maxAP, ap, ac, meleeDamage, critChance,
        skills,
        level, xp,
    };
}
