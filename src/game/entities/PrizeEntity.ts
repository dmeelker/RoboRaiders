import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { Entity } from "./Entity";

export class PriceEntity extends Entity {
    private _renderOffset = Vector.zero;

    public constructor(location: Vector) {
        super(location, new Size(10, 10));
    }

    public update(time: FrameTime) {
        this._renderOffset.y = Math.sin(time.currentTime / 100) * 2;
        console.log(this._renderOffset.y);
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "#00000066";
        viewport.context.fillRect(Math.floor(this.location.x + this._renderOffset.x + 1), Math.floor(this.location.y + this._renderOffset.y + 1), this.size.width, this.size.height);

        viewport.context.fillStyle = "gold";
        viewport.context.fillRect(Math.floor(this.location.x + this._renderOffset.x), Math.floor(this.location.y + this._renderOffset.y), this.size.width, this.size.height);
    }
}