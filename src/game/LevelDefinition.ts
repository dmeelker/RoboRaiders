import { Rectangle } from "../utilities/Trig";
import { EnemySpawnerConfiguration } from "./entities/EnemySpawner";
import { GateDirection } from "./entities/Gate";


export class LevelDefinition {
    public killZones: Rectangle[] = [];
    public gates: GateSetDefinition[] = [];
    public spawns: IEnemySpawnDefinition[] = [];

    public constructor(public code: string, public name: string) {
    }
}

export class GateSetDefinition {
    public constructor(public entrance: GateDefinition, public exit: GateDefinition) { }
}

export class GateDefinition {
    public constructor(public rect: Rectangle, public direction: GateDirection) { }
}

export interface IEnemySpawnDefinition {
    rect: Rectangle;
    configuration: EnemySpawnerConfiguration;
}