import { center } from "../../utilities/Align";
import { Size, Vector } from "../../utilities/Trig";
import { EnemySpawnDefinition, GateDefinition, GatePair, LevelDefinition } from "../Level";
import { GateDirection } from "../entities/Gate";

export function get(): LevelDefinition {
    //640, 480
    let level = new LevelDefinition();
    level.backdropImage = "level1";
    level.collisionImage = "level1-collisions";

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

    let spawn = new EnemySpawnDefinition();
    spawn.location = new Vector(center(640, 100), 0);
    spawn.size = new Size(100, 20);
    level.spawns.push(spawn);

    return level;
}