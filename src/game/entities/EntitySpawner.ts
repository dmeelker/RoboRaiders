import { FrameTime } from "../../utilities/FrameTime";
import { chance, randomArrayElement } from "../../utilities/Random";
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

        this.context.entityManager.add(enemy);
    }

    private createRandomEnemy(location: Vector) {
        let factories = [
            EntitySpawner.createBasicEnemy,
            EntitySpawner.createFastEnemy,
            EntitySpawner.createLargeEnemy
        ];

        return randomArrayElement(factories)(location, this.context);
    }

    private static createBasicEnemy(location: Vector, context: IGameContext) {
        let animations = {
            standLeft: context.resources.animations.runnerBotStandLeft,
            standRight: context.resources.animations.runnerBotStandRight,
            walkLeft: context.resources.animations.runnerBotWalkLeft,
            walkRight: context.resources.animations.runnerBotWalkRight,
            jumpLeft: context.resources.animations.runnerBotJumpLeft,
            jumpRight: context.resources.animations.runnerBotJumpRight
        };

        let enemy = new EnemyEntity(location, animations, context);
        enemy.hitpoints = 10;
        enemy.speed = 200;
        return enemy;
    }

    private static createFastEnemy(location: Vector, context: IGameContext) {
        let animations = {
            standLeft: context.resources.animations.runnerBotStandLeft,
            standRight: context.resources.animations.runnerBotStandRight,
            walkLeft: context.resources.animations.runnerBotWalkLeft,
            walkRight: context.resources.animations.runnerBotWalkRight,
            jumpLeft: context.resources.animations.runnerBotJumpLeft,
            jumpRight: context.resources.animations.runnerBotJumpRight
        };

        let enemy = new EnemyEntity(location, animations, context);
        enemy.hitpoints = 5;
        enemy.speed = 300;
        return enemy;
    }

    private static createLargeEnemy(location: Vector, context: IGameContext) {
        let animations = {
            standLeft: context.resources.animations.runnerBotStandLeft,
            standRight: context.resources.animations.runnerBotStandRight,
            walkLeft: context.resources.animations.runnerBotWalkLeft,
            walkRight: context.resources.animations.runnerBotWalkRight,
            jumpLeft: context.resources.animations.runnerBotJumpLeft,
            jumpRight: context.resources.animations.runnerBotJumpRight
        };

        let enemy = new EnemyEntity(location, animations, context);
        enemy.hitpoints = 15;
        enemy.speed = 150;
        return enemy;
    }

    private randomFacing(): Facing {
        return chance(50) ? Facing.Left : Facing.Right;
    }

    public render(_viewport: Viewport) {
        //viewport.context.fillStyle = "maroon";
        //viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }
}