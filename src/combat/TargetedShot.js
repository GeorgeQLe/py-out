export const BodyParts = {
    HEAD:  { name: 'Head',  hitPenalty: -40, critMultiplier: 3, effect: null },
    TORSO: { name: 'Torso', hitPenalty: 0,   critMultiplier: 2, effect: null },
    ARMS:  { name: 'Arms',  hitPenalty: -30, critMultiplier: 2, effect: 'disarm' },
    LEGS:  { name: 'Legs',  hitPenalty: -20, critMultiplier: 2, effect: 'slow' },
    GROIN: { name: 'Groin', hitPenalty: -30, critMultiplier: 2, effect: 'stun' },
    EYES:  { name: 'Eyes',  hitPenalty: -60, critMultiplier: 3, effect: 'blind' },
};

export const BodyPartKeys = Object.keys(BodyParts);
