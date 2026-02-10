export const merchantDialogue = {
    id: 'merchant',
    startNode: 'start',
    nodes: {
        start: {
            text: "Welcome to my humble shop, traveler. The wasteland's been rough lately, but I still got goods. What can I do for you?",
            responses: [
                { text: "What do you have for sale?", next: 'barter' },
                { text: "What can you tell me about this place?", next: 'info' },
                {
                    text: "I heard you know something about the vault.",
                    next: 'vault_info',
                    condition: { type: 'questActive', questId: 'find_vault' },
                },
                {
                    text: "Maybe you could give me a discount...",
                    next: 'discount',
                    condition: { type: 'skillCheck', skill: 'speech', value: 40 },
                },
                { text: "Goodbye.", next: 'end' },
            ],
        },
        barter: {
            text: "Take a look. Everything's priced fair - caps only. No IOUs.",
            responses: [
                {
                    text: "[Barter]",
                    next: 'end',
                    effects: [{ type: 'openBarter' }],
                },
                { text: "Maybe later.", next: 'start' },
            ],
        },
        info: {
            text: "This outpost? Used to be a military checkpoint before the bombs fell. Now it's just a waystation for caravans. Watch out for the raiders to the east - they've been getting bolder.",
            responses: [
                { text: "Tell me about the raiders.", next: 'raiders' },
                { text: "Any work available?", next: 'work' },
                { text: "Thanks for the info.", next: 'start' },
            ],
        },
        raiders: {
            text: "Nasty bunch. Set up camp in the old factory. Their boss, Slag, is one mean SOB. Somebody ought to do something about them, but I'm just a merchant.",
            responses: [
                { text: "Maybe I can help with that.", next: 'raider_quest' },
                { text: "I'll keep that in mind.", next: 'start' },
            ],
        },
        raider_quest: {
            text: "You serious? Well, if you can clear them out, I'll make it worth your while. Got some good gear stashed away for a rainy day.",
            responses: [
                {
                    text: "Consider it done.",
                    next: 'start',
                    effects: [{ type: 'startQuest', questId: 'clear_raiders' }],
                },
                { text: "I'll think about it.", next: 'start' },
            ],
        },
        work: {
            text: "Always need someone to run packages between outposts. Dangerous work, but pays decent. Interested?",
            responses: [
                {
                    text: "Sure, I'll take the job.",
                    next: 'delivery_accept',
                    effects: [{ type: 'startQuest', questId: 'delivery_run' }],
                },
                { text: "Not right now.", next: 'start' },
            ],
        },
        delivery_accept: {
            text: "Great. Take this package to the trading post south of here. Don't open it. Don't ask what's inside. Just deliver it and come back for your pay.",
            responses: [
                {
                    text: "I won't let you down.",
                    next: 'end',
                    effects: [{ type: 'giveItem', item: { id: 'package', name: 'Sealed Package', type: 'quest', glyph: '?', fg: '#aa8833', weight: 2 } }],
                },
                {
                    text: "What's in the package?",
                    next: 'package_question',
                    condition: { type: 'skillCheck', skill: 'speech', value: 50 },
                },
            ],
        },
        package_question: {
            text: "...Fine. Medical supplies. Can't ship them openly or the raiders will intercept. Happy now?",
            responses: [
                { text: "Your secret's safe. I'll deliver it.", next: 'end' },
            ],
        },
        vault_info: {
            text: "The vault? Old man Jenkins used to talk about one north of here, hidden in the hills. Said you need some kind of keycard to get in. He's long gone now, but his workshop might still have notes.",
            responses: [
                { text: "Where's the workshop?", next: 'vault_workshop' },
                { text: "Thanks.", next: 'start' },
            ],
        },
        vault_workshop: {
            text: "East end of the outpost, through the locked door. You'll need to pick it or find the key. I think one of those raiders had it last I heard.",
            responses: [
                { text: "I'll check it out.", next: 'start' },
            ],
        },
        discount: {
            text: "Ha! You've got a silver tongue. Alright, I'll knock 10% off for you. Don't go telling everyone though.",
            responses: [
                {
                    text: "Deal.",
                    next: 'start',
                    effects: [{ type: 'setFlag', flag: 'merchant_discount', value: true }],
                },
            ],
        },
    },
};
