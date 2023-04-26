import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { Entity } from "./Entity";

export class PriceEntity extends Entity {
    public constructor(location: Vector) {
        super(location, new Size(10, 10));
    }

    public update(time: FrameTime) {

    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "gold";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }
}