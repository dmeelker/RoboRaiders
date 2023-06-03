import { Rectangle } from "../../utilities/Trig";
import { GateDefinition, GateSetDefinition, LevelDefinition } from "../LevelDefinition";
import { GateDirection } from "../entities/Gate";

let level = new LevelDefinition("level1", "Temple");

let floorHeight = 20;

// Bottom left to top right
level.gates.push(new GateSetDefinition(
    new GateDefinition(new Rectangle(0, 480 - 60 - floorHeight, 20, 60), GateDirection.Left),
    new GateDefinition(new Rectangle(640 - 20, 4, 20, 60), GateDirection.Right),
));

// Bottom right to top left
level.gates.push(new GateSetDefinition(
    new GateDefinition(new Rectangle(640 - 20, 480 - 60 - floorHeight, 20, 60), GateDirection.Right),
    new GateDefinition(new Rectangle(0, 4, 20, 60), GateDirection.Left),
));

export default level;