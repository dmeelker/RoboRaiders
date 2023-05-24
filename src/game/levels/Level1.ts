import { center } from "../../utilities/Align";
import { Size, Vector } from "../../utilities/Trig";
import { GateDefinition, GatePair, LevelDefinition } from "../Level";
import { GateDirection } from "../entities/Gate";

export function get(): LevelDefinition {
    let level = new LevelDefinition();
    level.name = "level1";

    level.player1Location = new Vector(center(640, 32 - 50), 480 - 34 - 20);
    level.player2Location = new Vector(center(640, 32 + 50), 480 - 34 - 20);

    level.gates.push(new GatePair(
        // Bottom right
        new GateDefinition(new Vector(640 - 34, 480 - 64 - 20), GateDirection.Right),
        // Top left
        new GateDefinition(new Vector(0, 0), GateDirection.Left)
    ));

    level.gates.push(new GatePair(
        // Bottom left
        new GateDefinition(new Vector(0, 480 - 64 - 20), GateDirection.Left),
        // Top right
        new GateDefinition(new Vector(640 - 34, 0), GateDirection.Right)
    ));

    return level;
}