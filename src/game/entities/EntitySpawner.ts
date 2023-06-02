import { FrameTime } from "../../utilities/FrameTime";
import { interpolate } from "../../utilities/Math";
import { chance, randomArrayElement } from "../../utilities/Random";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { EnemyEntity, FlyingEnemyEntity, WalkingEnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

export class EntitySpawner extends Entity {
    private _lastSpawnTime = -10000;

    private get interval() { return interpolate(5000, 2000, this.context.difficulty); }
    private get timeSinceLastSpawn() { return this.context.time.currentTime - this._lastSpawnTime; }

    public constructor(location: Vector, size: Size, context: IGameContext) {
        super(location, size, context);
    }

    public update(time: FrameTime) {
        if (this.timeSinceLastSpawn > this.interval) {
            this.spawnEnemy(time);
        };
    }

    public spawnEnemy(time: FrameTime) {
        let enemy = this.createRandomEnemy(this.centerLocation);
        enemy.location.x = this.location.y;
        enemy.location.x = this.centerLocation.x - (enemy.width / 2);

        this.context.entityManager.add(enemy);
        this._lastSpawnTime = time.currentTime;
    }

    private createRandomEnemy(location: Vector) {
        let factories = this.getAvailableEnemyTypes();

        return randomArrayElement(factories)(location, this.context);
    }

    private getAvailableEnemyTypes() {
        let availableTypes: Array<(location: Vector, context: IGameContext) => EnemyEntity> = [
            EntitySpawner.createBasicEnemy
        ];

        if (this.context.difficulty > 0.3) {
            availableTypes.push(EntitySpawner.createLargeEnemy);
        }

        if (this.context.difficulty > 0.4) {
            availableTypes.push(EntitySpawner.createFlyingEnemy);
        }

        if (this.context.difficulty > 0.7) {
            availableTypes.push(EntitySpawner.createFastEnemy);
        }

        return availableTypes;
    }

    private static createBasicEnemy(location: Vector, context: IGameContext) {
        let animations = {
            standLeft: context.resources.animations.runnerBotStandLeft,
            standRight: context.resources.animations.runnerBotStandRight,
            walkLeft: context.resources.animations.runnerBotWalkLeft,
            walkRight: context.resources.animations.runnerBotWalkRight,
            jumpLeft: context.resources.animations.runnerBotJumpLeft,
            jumpRight: context.resources.animations.runnerBotJumpRight,
            hitLeft: context.resources.animations.runnerBotHitLeft,
            hitRight: context.resources.animations.runnerBotHitRight,
        };

        let enemy = new WalkingEnemyEntity(location, animations, context);
        enemy.hitpoints = 10;
        enemy.speed = 200;
        enemy.facing = EntitySpawner.randomFacing();
        return enemy;
    }

    private static createFastEnemy(location: Vector, context: IGameContext) {
        let animations = {
            standLeft: context.resources.animations.fastBotStandLeft,
            standRight: context.resources.animations.fastBotStandRight,
            walkLeft: context.resources.animations.fastBotWalkLeft,
            walkRight: context.resources.animations.fastBotWalkRight,
            jumpLeft: context.resources.animations.fastBotJumpLeft,
            jumpRight: context.resources.animations.fastBotJumpRight,
            hitLeft: context.resources.animations.fastBotHitLeft,
            hitRight: context.resources.animations.fastBotHitRight,
        };

        let enemy = new WalkingEnemyEntity(location, animations, context);
        enemy.hitpoints = 5;
        enemy.speed = 250;
        enemy.facing = EntitySpawner.randomFacing();
        return enemy;
    }

    private static createLargeEnemy(location: Vector, context: IGameContext) {
        let animations = {
            standLeft: context.resources.animations.rollerBotStandLeft,
            standRight: context.resources.animations.rollerBotStandRight,
            walkLeft: context.resources.animations.rollerBotWalkLeft,
            walkRight: context.resources.animations.rollerBotWalkRight,
            jumpLeft: context.resources.animations.rollerBotJumpLeft,
            jumpRight: context.resources.animations.rollerBotJumpRight,
            hitLeft: context.resources.animations.rollerBotHitLeft,
            hitRight: context.resources.animations.rollerBotHitRight,
        };

        let enemy = new WalkingEnemyEntity(location, animations, context);
        enemy.hitpoints = 20;
        enemy.speed = 100;
        enemy.facing = EntitySpawner.randomFacing();
        enemy.heavy = true;
        return enemy;
    }

    private static createFlyingEnemy(location: Vector, context: IGameContext) {
        let enemy = new FlyingEnemyEntity(location, context);
        enemy.hitpoints = 10;
        enemy.speed = 20;
        return enemy;
    }

    private static randomFacing(): Facing {
        return chance(50) ? Facing.Left : Facing.Right;
    }

    public render(_viewport: Viewport) {
        //viewport.context.fillStyle = "maroon";
        //viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }
}