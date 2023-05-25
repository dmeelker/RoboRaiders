import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { Entity } from "./Entity";

export class PriceEntity extends Entity {
    public static size = new Size(32, 26);
    private _renderOffset = Vector.zero;
    private _image: ImageBitmap;

    public constructor(location: Vector, gameContext: IGameContext) {
        super(location, PriceEntity.size, gameContext);
        this._image = gameContext.resources.images.crate;

    }

    public update(time: FrameTime) {
        this._renderOffset.y = Math.sin(time.currentTime / 100) * 2;
    }

    public render(viewport: Viewport) {
        viewport.context.drawImage(this._image, Math.floor(this.location.x + this._renderOffset.x), Math.floor(this.location.y + this._renderOffset.y));
    }
}