import { center } from "../../utilities/Align";
import { Rectangle, Size, Vector } from "../../utilities/Trig";
import { EnemySpawnDefinition, GateDefinition, LevelDefinition } from "../Level";
import { GateDirection } from "../entities/Gate";

export function get(): LevelDefinition {
    //640, 480
    let level = new LevelDefinition();
    level.blocks.push(createPlatform(new Vector(170, 350), 300));

    level.blocks.push(createPlatform(new Vector(0, 250), 100));
    level.blocks.push(createPlatform(new Vector(640 - 100, 250), 100));
    //level.blocks.push(createPlatform(new Vector(170, 150), 300));

    level.blocks.push(createPlatform(new Vector(170, 150), 300));

    level.blocks.push(createPlatform(new Vector(0, 64), 100));
    level.blocks.push(createPlatform(new Vector(640 - 100, 64), 100));

    // level.blocks.push(new Rectangle(0, 40, 22, 10));
    // level.blocks.push(new Rectangle(200 - 22, 40, 22, 10));
    // level.blocks.push(new Rectangle(50, 100, 100, 10));
    // level.blocks.push(new Rectangle(0, 150, 50, 10));
    // level.blocks.push(new Rectangle(150, 150, 50, 10));

    createGatePair(
        {
            id: "topleft",
            direction: GateDirection.Left,
            location: new Vector(0, 0)
        },
        {
            id: "bottomright",
            direction: GateDirection.Right,
            location: new Vector(640 - 34, 480 - 64)
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
            location: new Vector(0, 480 - 64)
        }, level.gates);

    let spawn = new EnemySpawnDefinition();
    spawn.location = new Vector(center(640, 100), 0);
    spawn.size = new Size(100, 20);
    level.spawns.push(spawn);

    return level;
}

function createPlatform(location: Vector, length: number): Rectangle {
    return new Rectangle(location.x, location.y, length, 20);
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