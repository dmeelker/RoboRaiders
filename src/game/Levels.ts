import { LevelDefinition } from "./LevelDefinition";
import level1 from "./levels/Level1";
import level3 from "./levels/Level3";
import level4 from "./levels/Level4";

export const levels = [
    level1,
    new LevelDefinition("level2", "Big bang"),
    level3,
    level4,
];