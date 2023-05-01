import { Resources } from "../Main";
import { InputProvider, Keys } from "../input/InputProvider";
import { FrameTime } from "../utilities/FrameTime";
import { randomArrayElement, randomInt } from "../utilities/Random";
import { Size, Vector } from "../utilities/Trig";
import { Viewport } from "../utilities/Viewport";
import { Level, LevelDefinition } from "./Level";
import { Player } from "./Player";
import { EntityManager } from "./entities/EntityManager";
import { EntitySpawner } from "./entities/EntitySpawner";
import { Gate } from "./entities/Gate";
import { PriceEntity as PrizeEntity } from "./entities/PrizeEntity";
import * as Level1 from "./levels/Level1";

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
    private _level: Level = null!;
    private _player: Player = null!;
    private _prize: PrizeEntity = null!;

    private _scoreLabel = document.createElement("div");

    public constructor(viewport: Viewport, resources: Resources, input: InputProvider) {
        this._viewport = viewport;
        this._resources = resources;
        this._input = input;
    }

    public reset(time: FrameTime) {
        this._entities.clear();
        this.initialize(time);
    }

    public initialize(_time: FrameTime) {
        this.loadLevel(Level1.get());

        this._player = new Player(new Vector(100, 100), this);
        this._entities.add(this._player.entity);

        this.spawnPrize();

        this._scoreLabel.className = "ui-label";
        this.updateScoreLabel();
        this.viewport.uiElement.appendChild(this._scoreLabel);
    }

    public loadLevel(level: LevelDefinition) {
        this._level = new Level(new Size(640, 480), level.blocks);

        for (let spawn of level.spawns) {
            this._entities.add(new EntitySpawner(spawn.location, spawn.size, this));
        }

        let gates = new Map<string, Gate>();
        for (let g of level.gates) {
            gates.set(g.id, new Gate(g.location, g.direction, this));
        }

        for (let g of level.gates) {
            let g1 = gates.get(g.id)!;
            let g2 = gates.get(g.matchingGateId)!;

            g1._matchingGate = g2;
            g2._matchingGate = g1;

            this._entities.add(g1);
            this._entities.add(g2);
        }
    }

    private spawnPrize() {
        let area = randomArrayElement(this._level.itemSpawnAreas);
        let x = randomInt(0, area.width - 20);

        let location = new Vector(area.x + x, area.y + area.height - 20);

        this._prize = new PrizeEntity(location, this);
        this._entities.add(this._prize);
    }

    public update(time: FrameTime) {
        if (this.input.isButtonDown(Keys.A)) {
            this._player.entity.jump(time);
        } else {
            this._player.entity.stopJump();
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

        if (this._player.entity.dead) {
            this.reset(time);
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