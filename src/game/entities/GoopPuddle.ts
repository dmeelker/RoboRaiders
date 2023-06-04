import { FrameTime } from "../../utilities/FrameTime";
import { Timer } from "../../utilities/Timer";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { Entity } from "./Entity";

export class GoopPuddle extends Entity {
    private _image: ImageBitmap;
    public physics: PhyicalObject;
    private _dropped = false;
    private _hitTimer: Timer;

    public constructor(location: Vector, context: IGameContext) {
        super(location, new Size(0, 0), context);
        this._image = context.resources.images.goopBall;
        this.size = new Size(this._image.width, this._image.height);
        this.location = location.subtract(new Vector(this.size.width / 2, this.size.height));
        this._hitTimer = Timer.createRepeating(500, context.time);

        const newLocal = this;
        this.physics = new PhyicalObject(
            this,
            Vector.zero,
            new CollisionContext(newLocal.context.level, this.context.entityManager));
        this.physics.gravity = true;
    }

    public update(time: FrameTime) {
        if (this.age > 5000) {
            this.markDisposable();
        }

        if (!this._dropped) {
            this.physics.update(time);

            if (this.physics.onGround) {
                let newImage = this.context.resources.images.goop1;
                this.location = new Vector(this.centerLocation.x - (newImage.width / 2), this.location.y + this._image.height - newImage.height);
                this._image = this.context.resources.images.goop1;
                this.size = new Size(this._image.width, this._image.height);
                this._dropped = true;
            }
        } else {
            this._hitTimer.update(time, () => {
                let enemies = this.context.entityManager.getEnemies().filter(e => this.bounds.overlaps(e.bounds));
                enemies.forEach(e => e.hit(1));
            });
        }
    }

    public render(viewport: Viewport) {
        let location = this.centerLocation.floor();
        viewport.context.translate(location.x, location.y);
        viewport.context.drawImage(this._image, -(this.size.width / 2), -(this.size.height / 2), this.size.width, this.size.height);
        viewport.context.resetTransform();
    }
}