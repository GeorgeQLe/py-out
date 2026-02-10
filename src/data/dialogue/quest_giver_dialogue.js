export const questGiverDialogue = {
    id: 'quest_giver',
    startNode: 'start',
    nodes: {
        start: {
            text: "You look capable. Not many people wander into this part of the wasteland willingly. I'm Commander Hayes, what's left of the local militia.",
            responses: [
                { text: "What happened here?", next: 'backstory' },
                { text: "I'm looking for work.", next: 'work' },
                {
                    text: "I already dealt with the raiders.",
                    next: 'raiders_done',
                    condition: { type: 'questComplete', questId: 'clear_raiders' },
                },
                { text: "Just passing through.", next: 'end' },
            ],
        },
        backstory: {
            text: "Raiders hit us hard last month. Killed half my people, took our supplies. We've been barely holding on. The vault to the north - that's our only hope. Pre-war tech, medicine, weapons. But nobody's been able to get in.",
            responses: [
                { text: "I could try to find a way in.", next: 'vault_quest' },
                { text: "Sounds like someone else's problem.", next: 'refuse' },
                {
                    text: "I know a thing or two about pre-war technology...",
                    next: 'science_option',
                    condition: { type: 'skillCheck', skill: 'science', value: 50 },
                },
            ],
        },
        vault_quest: {
            text: "You'd do that? The entrance is somewhere in the hills north of here. You'll need a keycard - the old watchman had one before the raiders got him. Check the raider camp or the old workshop.",
            responses: [
                {
                    text: "I'll find a way in.",
                    next: 'end',
                    effects: [{ type: 'startQuest', questId: 'find_vault' }],
                },
            ],
        },
        science_option: {
            text: "You do? That changes things. Most vault doors have emergency bypass codes. If you can find a working terminal, you might be able to hack your way in without the keycard.",
            responses: [
                {
                    text: "I'll see what I can do.",
                    next: 'end',
                    effects: [
                        { type: 'startQuest', questId: 'find_vault' },
                        { type: 'setFlag', flag: 'vault_science_path', value: true },
                    ],
                },
            ],
        },
        work: {
            text: "Work? Plenty of that. We need someone to scout the raider positions and, if possible, thin their numbers. There's also the matter of our water purifier - thing's been on the fritz.",
            responses: [
                {
                    text: "I'll deal with the raiders.",
                    next: 'raider_mission',
                    effects: [{ type: 'startQuest', questId: 'clear_raiders' }],
                },
                {
                    text: "I can look at the purifier.",
                    next: 'purifier_quest',
                    condition: { type: 'skillCheck', skill: 'repair', value: 35 },
                },
                { text: "What's the pay?", next: 'pay' },
            ],
        },
        raider_mission: {
            text: "Good. Their camp is east of here. Be careful - they've got guns and they're not afraid to use them. Come back alive and I'll see you're rewarded.",
            responses: [
                { text: "I'll be back.", next: 'end' },
            ],
        },
        purifier_quest: {
            text: "You know machinery? Outstanding. The purifier's in the basement. Probably just needs a new filter and some rewiring. Parts should be around here somewhere.",
            responses: [
                {
                    text: "I'll take care of it.",
                    next: 'end',
                    effects: [{ type: 'startQuest', questId: 'fix_purifier' }],
                },
            ],
        },
        pay: {
            text: "Caps, supplies, weapons - whatever we can spare. We're not rich, but we take care of those who help us.",
            responses: [
                { text: "Fair enough. What needs doing?", next: 'work' },
                { text: "I need more than promises.", next: 'negotiate' },
            ],
        },
        negotiate: {
            text: "Can't blame you for being cautious. Tell you what - clear the raiders and I'll give you access to our armory. Pre-war gear, good condition.",
            responses: [
                {
                    text: "Now you're talking.",
                    next: 'end',
                    effects: [{ type: 'startQuest', questId: 'clear_raiders' }],
                },
                { text: "I'll think about it.", next: 'end' },
            ],
        },
        raiders_done: {
            text: "You cleared them out? Outstanding work! As promised, the armory is yours to browse. You've earned it.",
            responses: [
                {
                    text: "Thanks, Commander.",
                    next: 'end',
                    effects: [
                        { type: 'addXP', amount: 500 },
                        { type: 'giveItem', item: { id: 'armory_key', name: 'Armory Key', type: 'quest', glyph: '-', fg: '#ffaa00', weight: 0 } },
                    ],
                },
            ],
        },
        refuse: {
            text: "I understand. The wasteland doesn't leave much room for charity. If you change your mind, you know where to find me.",
            responses: [
                { text: "Maybe later.", next: 'end' },
            ],
        },
    },
};
