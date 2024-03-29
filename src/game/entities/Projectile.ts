import { setSize } from "../../utilities/Dom";
import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";

export class ProjectileEntity extends Entity {
    public physics: PhyicalObject;
    public power = 1;
    public maxAge?: number;
    private _image: ImageBitmap;

    public constructor(location: Vector, velocity: Vector, time: FrameTime, gameContext: IGameContext) {
        super(location, new Size(gameContext.resources.images.bullet.width, gameContext.resources.images.bullet.height), gameContext);

        this._image = gameContext.resources.images.bullet;

        this.physics = new PhyicalObject(
            this,
            velocity,
            new CollisionContext(this.context.level, this.context.entityManager),
            entity => entity instanceof EnemyEntity);
        this.physics.gravity = false;
    }

    public update(time: FrameTime) {
        if (this.maxAge && this.age > this.maxAge) {
            this.markDisposable();
            return;
        }

        this.physics.update(time);

        if (this.physics.lastCollisions.length > 0) {
            this.markDisposable();

            let hitEnemies = this.physics.lastCollisions.filter(c => c.entity instanceof EnemyEntity).map(c => c.entity as EnemyEntity);

            for (let enemy of hitEnemies) {
                enemy.hit(this.power, this.physics.velocity);
            }
        }
    }

    public render(viewport: Viewport) {
        this.drawCenteredImage(this._image, viewport);
    }
}