export function CombatState() {
    return {
        inCombat: false,
        initiative: 0,
        overwatching: false,
        overwatchAP: 0,
        equippedWeapon: null,
        equippedArmor: null,
        statusEffects: [],   // { type, duration, strength }
    };
}
