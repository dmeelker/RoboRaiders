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

    public constructor(location: Vector, velocity: Vector, gameContext: IGameContext) {
        super(location, new Size(4, 4), gameContext);

        this.physics = new PhyicalObject(
            this,
            velocity,
            new CollisionContext(this.context.level, this.context.entityManager),
            entity => entity instanceof EnemyEntity);
        this.physics.gravity = false;
    }

    public update(time: FrameTime) {
        this.physics.update(time);

        if (this.physics.lastCollisions.length > 0) {
            this.markDisposable();
        }

        let hitEnemies = this.physics.lastCollisions.filter(c => c.entity instanceof EnemyEntity).map(c => c.entity as EnemyEntity);

        for (let enemy of hitEnemies) {
            enemy.hit(this.power);
        }
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "red";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }
}