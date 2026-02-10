export function Inventory(maxWeight = 150) {
    return {
        items: [],       // array of item objects
        maxWeight,
        equippedWeapon: null,
        equippedArmor: null,
    };
}
