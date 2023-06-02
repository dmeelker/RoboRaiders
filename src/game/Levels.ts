export class LevelDefinition {
    public constructor(public code: string, public name: string) {

    }
}

export const levels = [
    new LevelDefinition("level1", "Temple"),
    new LevelDefinition("level2", "Big bang"),
    new LevelDefinition("level3", "Alien Invasion"),
    new LevelDefinition("level4", "No swimming!"),
];