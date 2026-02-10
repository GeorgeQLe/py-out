export const ObjectiveType = {
    KILL: 'kill',
    FETCH_ITEM: 'fetchItem',
    TALK_TO: 'talkTo',
    REACH_LOCATION: 'reachLocation',
    ESCORT: 'escort',
    SKILL_USE: 'skillUse',
};

export function QuestObjective(type, description, target = 1, params = {}) {
    return {
        type,
        description,
        target,
        current: 0,
        completed: false,
        ...params,
    };
}
