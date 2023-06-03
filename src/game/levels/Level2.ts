import { Rectangle } from "../../utilities/Trig";
import { LevelDefinition } from "../LevelDefinition";
import { EnemySpawnerConfiguration } from "../entities/EnemySpawner";

let level = new LevelDefinition("level2", "Big bang");

level.spawns.push({
    rect: new Rectangle(20, 0, 80, 20),
    configuration: new EnemySpawnerConfiguration()
});

level.spawns.push({
    rect: new Rectangle(640 - 100, 0, 80, 20),
    configuration: new EnemySpawnerConfiguration()
});

export default level;