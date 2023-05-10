import { FrameTime } from "../../utilities/FrameTime";
import { chance, randomArrayElement, randomInt } from "../../utilities/Random";
import { Timer } from "../../utilities/Timer";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

export class EntitySpawner extends Entity {
    private _timer: Timer = null!;
    public interval = 5000;

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
        let enemy = this.createRandomEnemy(this.centerLocation);
        enemy.facing = this.randomFacing();

        console.log(enemy.size);
        this.context.entityManager.add(enemy);
    }

    private createRandomEnemy(location: Vector) {
        let factories = [(l) => this.createBasicEnemy(l), (l) => this.createFastEnemy(l), (l) => this.createLargeEnemy(l)];
        return randomArrayElement(factories)(location);
    }

    private createBasicEnemy(location: Vector) {
        let enemy = new EnemyEntity(location, new Size(32, 32), this.context);
        enemy.hitpoints = 10;
        enemy.speed = 200;
        return enemy;
    }

    private createFastEnemy(location: Vector) {
        let enemy = new EnemyEntity(location, new Size(24, 24), this.context);
        enemy.hitpoints = 5;
        enemy.speed = 300;
        return enemy;
    }

    private createLargeEnemy(location: Vector) {
        let enemy = new EnemyEntity(location, new Size(45, 45), this.context);
        enemy.hitpoints = 15;
        enemy.speed = 150;
        return enemy;
    }

    private randomFacing(): Facing {
        return chance(50) ? Facing.Left : Facing.Right;
    }

    public render(viewport: Viewport) {
        //viewport.context.fillStyle = "maroon";
        //viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }
}