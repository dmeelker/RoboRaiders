export class LevelDefinition {
    public constructor(public code: string, public name: string) {

    }
}

export const levels = [
    new LevelDefinition("level1", "Temple"),
    new LevelDefinition("level2", "Prototype"),
    new LevelDefinition("level3", "Platforms"),
];