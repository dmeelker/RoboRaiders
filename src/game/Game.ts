import { Resources } from "../Main";
import { InputProvider, Keys } from "../input/InputProvider";
import { FrameTime } from "../utilities/FrameTime";
import { randomInt } from "../utilities/Random";
import { Vector } from "../utilities/Trig";
import { Viewport } from "../utilities/Viewport";
import { Level } from "./Level";
import { Player } from "./Player";
import { EnemyEntity } from "./entities/Enemy";
import { EntityManager } from "./entities/EntityManager";
import { PriceEntity as PrizeEntity } from "./entities/PrizeEntity";
import { ProjectileEntity } from "./entities/Projectile";

export interface IGameContext {
    get resources(): Resources;
    get level(): Level;
    get entityManager(): EntityManager;
}

export class Game implements IGameContext {
    private readonly _viewport: Viewport;
    private readonly _resources: Resources;
    private readonly _input: InputProvider;
    private readonly _entities = new EntityManager();
    private _level = new Level();
    private _player: Player = null!;
    private _prize: PrizeEntity = null!;

    public constructor(viewport: Viewport, resources: Resources, input: InputProvider) {
        this._viewport = viewport;
        this._resources = resources;
        this._input = input;
    }

    public initialize(_time: FrameTime) {
        this._player = new Player(new Vector(200, 200), this);
        this._entities.add(this._player.entity);

        let enemy = new EnemyEntity(new Vector(200, 100), this);
        this._entities.add(enemy);

        this.spawnPrize();
    }

    private spawnPrize() {
        this._prize = new PrizeEntity(new Vector(randomInt(100, 300), randomInt(100, 300)), this);
        this._entities.add(this._prize);
    }

    public update(time: FrameTime) {
        if (this.input.isButtonDown(Keys.A)) {
            this._player.entity.jump();
        }

        if (this.input.wasButtonPressedInFrame(Keys.B)) {
            let projectile = new ProjectileEntity(this._player.entity.centerLocation, this._player.entity.lookVector.multiplyScalar(500), this);
            this._entities.add(projectile);
        }

        if (this.input.isButtonDown(Keys.MoveLeft)) {
            this._player.entity.moveLeft();
        } else if (this.input.isButtonDown(Keys.MoveRight)) {
            this._player.entity.moveRight();
        } else {
            this._player.entity.physics.velocity.x = 0;
        }

        if (this._prize.disposed) {
            this.spawnPrize();
        }

        this._entities.update(time);
    }

    public render() {
        //this.viewport.clearCanvas();


        this.viewport.context.fillStyle = "pink";
        this.viewport.context.fillRect(0, 0, this.viewport.width, this.viewport.height);
        this._level.render(this.viewport);

        this._entities.render(this.viewport);
    }

    private get viewport(): Viewport { return this._viewport; }
    private get input(): InputProvider { return this._input; }

    public get resources() { return this._resources; }
    public get level() { return this._level; }
    public get entityManager() { return this._entities; }
}