import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { ExplosionEntity } from "./Explosion";

export class GrenadeLauncherGrenadeEntity extends Entity {
    public physics: PhyicalObject;
    private _image: ImageBitmap;

    public constructor(location: Vector, velocity: Vector, gameContext: IGameContext) {
        super(location, new Size(4, 4), gameContext);

        this._image = gameContext.resources.images.grenadeLauncherGrenade; //gameContext.resources.images.gravityGrenadeArmed;
        this.size = new Size(this._image.width, this._image.height);

        this.physics = new PhyicalObject(
            this,
            velocity,
            new CollisionContext(this.context.level, this.context.entityManager),
            entity => entity instanceof EnemyEntity);
        this.physics.gravity = true;
        this.physics.gravityVector = new Vector(0, 1000);
    }

    public update(time: FrameTime) {
        this.physics.update(time);

        if (this.physics.lastCollisions.length > 0) {
            this.detonate(time);
        }
    }

    private detonate(time: FrameTime) {
        let explosion = new ExplosionEntity(this.centerLocation, time, this.context);
        this.context.entityManager.add(explosion);
        this.markDisposable();
    }

    public render(viewport: Viewport) {
        let location = this.location.floor();

        viewport.context.translate(location.x, location.y);
        viewport.context.rotate(this.physics.velocity.angleInRadians);
        viewport.context.drawImage(this._image, -(this.size.width / 2), -(this.size.height / 2), this.size.width, this.size.height);

        viewport.context.resetTransform();
    }
}