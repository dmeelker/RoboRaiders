import { Rectangle } from "../../utilities/Trig";
import { GateDefinition, GateSetDefinition, LevelDefinition } from "../LevelDefinition";
import { GateDirection } from "../entities/Gate";

let level = new LevelDefinition("level4", "No swimming!");

level.gates.push(new GateSetDefinition(
    new GateDefinition(new Rectangle(0, 480 - 20, 320, 20), GateDirection.Down),
    new GateDefinition(new Rectangle(320, 0, 320, 20), GateDirection.Down),
));

level.gates.push(new GateSetDefinition(
    new GateDefinition(new Rectangle(320, 480 - 20, 320, 20), GateDirection.Down),
    new GateDefinition(new Rectangle(0, 0, 320, 20), GateDirection.Down),
));

//level.killZones.push(new Rectangle(0, 460, 640, 20));

export default level;