import { center } from "../../utilities/Align";
import { Rectangle, Size, Vector } from "../../utilities/Trig";
import { EnemySpawnDefinition, GateDefinition, LevelDefinition } from "../Level";
import { GateDirection } from "../entities/Gate";

export function get(): LevelDefinition {
    //640, 480
    let level = new LevelDefinition();
    level.backdropImage = "level1";

    level.blocks.push(createStonePlatform(new Vector(151, 150), 336)); // Upper

    level.blocks.push(createWoodPlatform(new Vector(0, 250), 100));
    level.blocks.push(createWoodPlatform(new Vector(640 - 100, 250), 100));

    level.blocks.push(createStonePlatform(new Vector(151, 350), 336)); // Middle

    level.blocks.push(createStonePlatform(new Vector(0, 64), 100));
    level.blocks.push(createStonePlatform(new Vector(640 - 100, 64), 100));

    level.blocks.push(createStonePlatform(new Vector(0, 460), 640)); // Bottow

    level.player1Location = new Vector(center(640, 32 - 50), 480 - 34 - 20);
    level.player2Location = new Vector(center(640, 32 + 50), 480 - 34 - 20);

    createGatePair(
        {
            id: "topleft",
            direction: GateDirection.Left,
            location: new Vector(0, 0)
        },
        {
            id: "bottomright",
            direction: GateDirection.Right,
            location: new Vector(640 - 34, 480 - 64 - 20)
        }, level.gates);

    createGatePair(
        {
            id: "topright",
            direction: GateDirection.Right,
            location: new Vector(640 - 34, 0)
        },
        {
            id: "bottomleft",
            direction: GateDirection.Left,
            location: new Vector(0, 480 - 64 - 20)
        }, level.gates);

    let spawn = new EnemySpawnDefinition();
    spawn.location = new Vector(center(640, 100), 0);
    spawn.size = new Size(100, 20);
    level.spawns.push(spawn);

    return level;
}

function createStonePlatform(location: Vector, length: number): Rectangle {
    return new Rectangle(location.x, location.y, length, 20);
}

function createWoodPlatform(location: Vector, length: number): Rectangle {
    return new Rectangle(location.x, location.y, length, 16);
}

interface IGateDefinition {
    id: string,
    direction: GateDirection,
    location: Vector
}

function createGatePair(gate1: IGateDefinition, gate2: IGateDefinition, gates: Array<GateDefinition>) {
    let g1 = new GateDefinition();
    g1.id = gate1.id;
    g1.location = gate1.location;
    g1.direction = gate1.direction;
    g1.matchingGateId = gate2.id;

    let g2 = new GateDefinition();
    g2.id = gate2.id;
    g2.location = gate2.location;
    g2.direction = gate2.direction;
    g2.matchingGateId = gate1.id;

    gates.push(g1);
    gates.push(g2);
}