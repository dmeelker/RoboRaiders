import { FrameTime } from "../../utilities/FrameTime";
import { Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";

export abstract class Weapon {
    public update(time: FrameTime): void { }

    public abstract fire(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void;
    public abstract render(location: Vector, direction: Vector, viewport: Viewport): void;
}