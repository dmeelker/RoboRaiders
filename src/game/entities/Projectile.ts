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
    private _creationTime = 0;
    public maxAge?: number;

    public constructor(location: Vector, velocity: Vector, time: FrameTime, gameContext: IGameContext) {
        super(location, new Size(4, 4), gameContext);

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
            this.markDisposable();
        }

        let hitEnemies = this.physics.lastCollisions.filter(c => c.entity instanceof EnemyEntity).map(c => c.entity as EnemyEntity);

        for (let enemy of hitEnemies) {
            enemy.hit(this.power, this.physics.velocity);
        }
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "red";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }
}