import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

export class RailgunDartEntity extends Entity {
    public physics: PhyicalObject;
    private _image: ImageBitmap;

    public constructor(location: Vector, velocity: Vector, gameContext: IGameContext) {
        super(location, new Size(0, 0), gameContext);

        this._image = gameContext.resources.images.dart;
        this.size = new Size(this._image.width, this._image.height);

        this.physics = new PhyicalObject(
            this,
            velocity,
            new CollisionContext(this.context.level, this.context.entityManager),
            entity => entity instanceof EnemyEntity);
        this.physics.gravity = false;
    }

    public update(time: FrameTime) {
        this.physics.update(time);

        for (let collision of this.physics.lastCollisions) {
            if (!collision.entity) {
                this.markDisposable();
            }

            if (collision.entity instanceof EnemyEntity) {
                collision.entity.hit(100);
            }
        }
    }

    public render(viewport: Viewport) {
        viewport.context.translate(Math.floor(this.location.x), Math.floor(this.location.y));

        if (this.facing == Facing.Right) {
            viewport.context.scale(-1, 1);
            viewport.context.translate(-this.size.width, 0);
        }

        viewport.context.drawImage(this._image, 0, 0);
        viewport.context.resetTransform();
    }

    private get facing() { return this.physics.velocity.x > 0 ? Facing.Right : Facing.Left; }
}