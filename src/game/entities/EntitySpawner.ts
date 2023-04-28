import { FrameTime } from "../../utilities/FrameTime";
import { chance, randomInt } from "../../utilities/Random";
import { Timer } from "../../utilities/Timer";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

export class EntitySpawner extends Entity {
    private _timer: Timer = null!;
    public interval = 10000;

    public constructor(location: Vector, size: Size, context: IGameContext) {
        super(location, size, context);
    }

    public update(time: FrameTime) {
        if (!this._timer) {
            this._timer = Timer.createRepeating(this.interval, time);
        }

        this._timer.update(time, () => {
            this.spawnEnemy();
        });
    }

    public spawnEnemy() {
        let enemy = new EnemyEntity(this.centerLocation, this.context);
        enemy.facing = this.randomFacing();
        this.context.entityManager.add(enemy);
    }

    private randomFacing(): Facing {
        return chance(50) ? Facing.Left : Facing.Right;
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "maroon";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }
}