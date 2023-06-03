import { FrameTime } from "../../utilities/FrameTime";
import { interpolate } from "../../utilities/Math";
import { chance, randomWeightedArrayElement } from "../../utilities/Random";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { EnemyEntity, FlyingEnemyEntity, WalkingEnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

type EnemyFactory = (location: Vector, context: IGameContext) => EnemyEntity;

export interface IEnemySpawnerConfigurationOptions {
    enemyTypes?: EnemySpawnConfiguration[];
    minSpawnInterval?: number;
    maxSpawnInterval?: number;
    delay?: number;
}

export class EnemySpawnerConfiguration {
    public enemyTypes: EnemySpawnConfiguration[] = [];
    public minSpawnInterval: number;
    public maxSpawnInterval: number;
    public delay: number

    public constructor(options: IEnemySpawnerConfigurationOptions = {}) {
        this.minSpawnInterval = options?.minSpawnInterval ?? 5000;
        this.maxSpawnInterval = options?.maxSpawnInterval ?? 2000;
        this.delay = options?.delay ?? 0;

        if (options?.enemyTypes) {
            this.enemyTypes = options?.enemyTypes;
        } else {
            this.enemyTypes.push(new EnemySpawnConfiguration(EnemySpawner.createBasicEnemy, 10, 0));
            this.enemyTypes.push(new EnemySpawnConfiguration(EnemySpawner.createLargeEnemy, 6, 0.3));
            this.enemyTypes.push(new EnemySpawnConfiguration(EnemySpawner.createFlyingEnemy, 3, 0.4));
            this.enemyTypes.push(new EnemySpawnConfiguration(EnemySpawner.createFastEnemy, 3, 0.7));
        }
    }
}

export class EnemySpawnConfiguration {
    public factory: EnemyFactory;
    public weight: number;
    public fromDifficulty: number;

    public constructor(factory: EnemyFactory, weight: number, fromDifficulty: number) {
        this.factory = factory;
        this.weight = weight;
        this.fromDifficulty = fromDifficulty;
    }
}

export class EnemySpawner extends Entity {
    private _lastSpawnTime = -10000;
    private readonly _configuration: EnemySpawnerConfiguration;

    private get interval() { return interpolate(this._configuration.minSpawnInterval, this._configuration.maxSpawnInterval, this.context.difficulty); }
    private get timeSinceLastSpawn() { return this.context.time.currentTime - this._lastSpawnTime; }

    public constructor(location: Vector, size: Size, context: IGameContext, configuration: EnemySpawnerConfiguration) {
        super(location, size, context);
        this._configuration = configuration;
        this._lastSpawnTime = context.time.currentTime - this.interval + configuration.delay;
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
        let enemyTypes = this.getAvailableEnemyTypes();
        let enemyType = randomWeightedArrayElement(enemyTypes, type => type.weight);

        return enemyType.factory(location, this.context);
    }

    private getAvailableEnemyTypes(): EnemySpawnConfiguration[] {
        return this._configuration.enemyTypes.filter(x => x.fromDifficulty <= this.context.difficulty);

        // let availableTypes: Array<(location: Vector, context: IGameContext) => EnemyEntity> = [
        //     EnemySpawner.createBasicEnemy
        // ];

        // if (this.context.difficulty > 0.3) {
        //     availableTypes.push(EnemySpawner.createLargeEnemy);
        // }

        // if (this.context.difficulty > 0.4) {
        //     availableTypes.push(EnemySpawner.createFlyingEnemy);
        // }

        // if (this.context.difficulty > 0.7) {
        //     availableTypes.push(EnemySpawner.createFastEnemy);
        // }

        // return availableTypes;
    }

    public static createBasicEnemy(location: Vector, context: IGameContext) {
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
        enemy.facing = EnemySpawner.randomFacing();
        return enemy;
    }

    public static createFastEnemy(location: Vector, context: IGameContext) {
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
        enemy.facing = EnemySpawner.randomFacing();
        return enemy;
    }

    public static createLargeEnemy(location: Vector, context: IGameContext) {
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
        enemy.facing = EnemySpawner.randomFacing();
        enemy.heavy = true;
        return enemy;
    }

    public static createFlyingEnemy(location: Vector, context: IGameContext) {
        let enemy = new FlyingEnemyEntity(location, context);
        enemy.hitpoints = 5;
        enemy.speed = 20;
        return enemy;
    }

    private static randomFacing(): Facing {
        return chance(50) ? Facing.Left : Facing.Right;
    }

    public render(viewport: Viewport) {
        if (this.context.debugMode) {
            viewport.context.fillStyle = "maroon";
            viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
        }
    }
}