export const mainQuest = {
    id: 'find_vault',
    name: 'Find the Vault',
    description: 'Locate and enter the abandoned vault north of the outpost. It may contain the supplies the settlement desperately needs.',
    xpReward: 1000,
    objectives: [
        {
            type: 'fetchItem',
            description: 'Find the Vault Keycard',
            target: 1,
            itemId: 'vault_keycard',
        },
        {
            type: 'reachLocation',
            description: 'Reach the Vault entrance',
            target: 1,
            targetX: 25,
            targetY: 5,
            mapId: 'abandoned_vault',
        },
    ],
};
