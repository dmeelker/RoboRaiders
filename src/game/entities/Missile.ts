import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { ExplosionEntity } from "./Explosion";
import { Facing } from "./PlayerEntity";

export class MissileEntity extends Entity {
    public physics: PhyicalObject;
    public power = 1;
    private _creationTime = 0;
    public maxAge?: number;
    private _image: ImageBitmap;

    public constructor(location: Vector, velocity: Vector, time: FrameTime, gameContext: IGameContext) {
        super(location, new Size(0, 0), gameContext);

        this._image = gameContext.resources.images.rpgGrenade;
        this.size = new Size(this._image.width, this._image.height);

        this._creationTime = time.currentTime;

        this.physics = new PhyicalObject(
            this,
            velocity,
            new CollisionContext(this.context.level, this.context.entityManager),
            entity => entity instanceof EnemyEntity);
        this.physics.gravity = false;
    }

    public update(time: FrameTime) {
        if (this.maxAge && time.currentTime - this._creationTime > this.maxAge) {
            this.markDisposable();
            return;
        }

        this.physics.update(time);

        if (this.physics.lastCollisions.length > 0) {
            this.detonate(time);
            this.markDisposable();
        }

        let hitEnemies = this.physics.lastCollisions.filter(c => c.entity instanceof EnemyEntity).map(c => c.entity as EnemyEntity);

        for (let enemy of hitEnemies) {
            enemy.hit(this.power);
        }
    }

    public detonate(time: FrameTime) {
        let explosion = new ExplosionEntity(this.centerLocation, time, this.context);
        this.context.entityManager.add(explosion);
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