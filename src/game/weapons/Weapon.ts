import { FrameTime } from "../../utilities/FrameTime";
import { Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";

export abstract class Weapon {
    public update(_time: FrameTime): void { }

    public fireSingleShot(_location: Vector, _direction: Vector, _context: IGameContext, _time: FrameTime): void { }
    public fireContinually(_location: Vector, _direction: Vector, _context: IGameContext, _time: FrameTime): void { }
    public abstract render(location: Vector, direction: Vector, viewport: Viewport): void;
}