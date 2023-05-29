export class LevelDefinition {
    public constructor(public code: string, public name: string) {

    }
}

export const levels = [
    new LevelDefinition("level1", "Cave"),
    new LevelDefinition("level2", "Prototype")
];