import { Rectangle } from "../../utilities/Trig";
import { GateDefinition, GateSetDefinition, LevelDefinition } from "../LevelDefinition";
import { EnemySpawnConfiguration, EnemySpawner, EnemySpawnerConfiguration } from "../entities/EnemySpawner";
import { GateDirection } from "../entities/Gate";

let level = new LevelDefinition("level4", "No swimming!");

level.gates.push(new GateSetDefinition(
    new GateDefinition(new Rectangle(0, 480 - 20, 640, 20), GateDirection.Down),
    new GateDefinition(new Rectangle(320 - 50, 0, 100, 20), GateDirection.Down),
));

level.killZones.push(new Rectangle(0, 460, 640, 20));

level.spawns.push({
    rect: new Rectangle(40, 0, 80, 20),
    configuration: new EnemySpawnerConfiguration({
        minSpawnInterval: 10000,
        maxSpawnInterval: 5000,
        delay: 5000,
        enemyTypes:
            [
                new EnemySpawnConfiguration(EnemySpawner.createFlyingEnemy, 1, 0),
            ]
    })
});

level.spawns.push({
    rect: new Rectangle(280, 0, 80, 20),
    configuration: new EnemySpawnerConfiguration()
});

level.spawns.push({
    rect: new Rectangle(520, 0, 80, 20),
    configuration: new EnemySpawnerConfiguration({
        minSpawnInterval: 10000,
        maxSpawnInterval: 5000,
        delay: 5000,
        enemyTypes:
            [
                new EnemySpawnConfiguration(EnemySpawner.createFlyingEnemy, 1, 0),
            ]
    })
});

export default level;