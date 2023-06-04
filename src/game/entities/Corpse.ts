import { FrameTime } from "../../utilities/FrameTime";
import { randomInt } from "../../utilities/Random";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { Entity } from "./Entity";

export class CorpseEntity extends Entity {
    public maxAge?: number;
    private readonly _image: ImageBitmap;
    private _velocity: Vector;
    private readonly _rotationSpeed = randomInt(500, 1500);

    public constructor(location: Vector, velocity: Vector, image: ImageBitmap, gameContext: IGameContext) {
        super(location, new Size(image.width, image.height), gameContext);

        this._image = image;
        this._velocity = velocity;
    }

    public update(time: FrameTime) {
        let gravity = time.scaleVector(new Vector(0, 1200));
        this._velocity = this._velocity.add(gravity);
        this.location = this.location.add(time.scaleVector(this._velocity));

        if (!this.context.viewport.containsRectangle(this.bounds)) {
            this.markDisposable();
        }
    }

    public render(viewport: Viewport) {
        viewport.context.translate(this.centerLocation.x, this.centerLocation.y);

        viewport.context.rotate(this.age / this._rotationSpeed);
        viewport.context.scale(1 + (this.age / 1000), 1 + (this.age / 1000));

        viewport.context.drawImage(this._image,
            Math.floor(- (this.width / 2)),
            Math.floor(- (this.height / 2)));
        viewport.context.resetTransform();
    }
}