import { Rectangle } from "../utilities/Trig";
import { GateDirection } from "./entities/Gate";


export class LevelDefinition {
    public killZones: Rectangle[] = [];
    public gates: GateSetDefinition[] = [];

    public constructor(public code: string, public name: string) {
    }
}

export class GateSetDefinition {
    public constructor(public entrance: GateDefinition, public exit: GateDefinition) { }
}

export class GateDefinition {
    public constructor(public rect: Rectangle, public direction: GateDirection) { }
}