import { Resources } from "../Main";
import { InputProvider, Keys } from "../input/InputProvider";
import { FrameTime } from "../utilities/FrameTime";
import { randomArrayElement, randomInt, randomLocation } from "../utilities/Random";
import { Size, Vector } from "../utilities/Trig";
import { Viewport } from "../utilities/Viewport";
import { Level } from "./Level";
import { Player } from "./Player";
import { EnemyEntity } from "./entities/Enemy";
import { EntityManager } from "./entities/EntityManager";
import { EntitySpawner } from "./entities/EntitySpawner";
import { Gate, GateDirection } from "./entities/Gate";
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
    private _level = new Level(new Size(200, 200));
    private _player: Player = null!;
    private _prize: PrizeEntity = null!;

    private _scoreLabel = document.createElement("div");

    public constructor(viewport: Viewport, resources: Resources, input: InputProvider) {
        this._viewport = viewport;
        this._resources = resources;
        this._input = input;
    }

    public initialize(_time: FrameTime) {
        this._player = new Player(new Vector(100, 200), this);

        {
            let gate1 = new Gate(new Vector(0, 0), GateDirection.Left, this);
            this._entities.add(gate1);

            let gate2 = new Gate(new Vector(200 - 22, 200 - 40), GateDirection.Right, this);
            this._entities.add(gate2);

            gate1._matchingGate = gate2;
            gate2._matchingGate = gate1;
        }

        {
            let gate1 = new Gate(new Vector(0, 200 - 40), GateDirection.Left, this);
            this._entities.add(gate1);

            let gate2 = new Gate(new Vector(200 - 22, 0), GateDirection.Right, this);
            this._entities.add(gate2);

            gate1._matchingGate = gate2;
            gate2._matchingGate = gate1;
        }

        this._entities.add(new EntitySpawner(new Vector(50, 0), new Size(100, 20), this));

        this._entities.add(this._player.entity);

        this.spawnPrize();

        this._scoreLabel.className = "ui-label";
        this.updateScoreLabel();
        this.viewport.uiElement.appendChild(this._scoreLabel);
    }

    private spawnPrize() {
        let area = randomArrayElement(this._level.itemSpawnAreas);
        let x = randomInt(0, area.width - 10);

        let location = new Vector(area.x + x, area.y + area.height - 10);

        this._prize = new PrizeEntity(location, this);
        this._entities.add(this._prize);
    }

    public update(time: FrameTime) {
        if (this.input.isButtonDown(Keys.A)) {
            this._player.entity.jump();
        }

        if (this.input.isButtonDown(Keys.B)) {
            this._player.entity.fire(time);
        }

        if (this.input.isButtonDown(Keys.MoveLeft)) {
            this._player.entity.moveLeft();
        } else if (this.input.isButtonDown(Keys.MoveRight)) {
            this._player.entity.moveRight();
        } else {
            this._player.entity.physics.velocity.x = 0;
        }

        if (this._prize.disposed) {
            this.updateScoreLabel();
            this.spawnPrize();
        }

        this._entities.update(time);
    }

    private updateScoreLabel() {
        this._scoreLabel.innerText = this._player.score.toString();
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