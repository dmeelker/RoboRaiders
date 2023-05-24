import { center } from "../../utilities/Align";
import { Vector } from "../../utilities/Trig";
import { LevelDefinition } from "../Level";

export function get(): LevelDefinition {
    let level = new LevelDefinition();
    level.name = "level1";

    level.player1Location = new Vector(center(640, 32 - 50), 480 - 34 - 20);
    level.player2Location = new Vector(center(640, 32 + 50), 480 - 34 - 20);

    return level;
}