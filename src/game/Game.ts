import { Inputs, Resources } from "../Main";
import { FrameTime } from "../utilities/FrameTime";
import { Color, ColorRange, Particle, NumberRange, ParticleSystem, Emitter, EmitterGroup, ParticleShape } from "../utilities/Particles";
import { randomArrayElement, randomInt } from "../utilities/Random";
import { Size, Vector } from "../utilities/Trig";
import { Viewport } from "../utilities/Viewport";
import { GateDefinition, Level, LevelDefinition } from "./Level";
import { createExplosion } from "./ParticleFactory";
import { Player } from "./Player";
import { EntityManager } from "./entities/EntityManager";
import { EntitySpawner } from "./entities/EntitySpawner";
import { Gate } from "./entities/Gate";
import { PriceEntity, PriceEntity as PrizeEntity } from "./entities/PrizeEntity";
import * as Level1 from "./levels/Level1";

export interface IGameContext {
    get time(): FrameTime;
    get resources(): Resources;
    get level(): Level;
    get entityManager(): EntityManager;
    get particleSystem(): ParticleSystem;
    addPoint(): void;
}

export class Game implements IGameContext {
    private readonly _viewport: Viewport;
    private readonly _resources: Resources;
    private readonly _inputs: Inputs;
    private readonly _entities = new EntityManager();
    private readonly _projectiles = new ParticleSystem();
    private _time: FrameTime = null!;
    private _level: Level = null!;
    private _backdropImage: ImageBitmap = null!;

    private _score = 0;
    private _players: Array<Player> = null!;
    private _prize: PrizeEntity = null!;

    private _scoreLabel = document.createElement("div");

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs) {
        this._viewport = viewport;
        this._resources = resources;
        this._inputs = inputs;
    }

    public reset(time: FrameTime) {
        this._entities.clear();
        this.initialize(time);
    }

    public initialize(time: FrameTime) {
        this._time = time;
        this.loadLevel(Level1.get());

        for (let player of this._players) {
            this._entities.add(player.entity);
        }

        this.spawnPrize();

        this._scoreLabel.className = "ui-label";
        this._scoreLabel.style.textAlign = "center";
        this.viewport.uiElement.appendChild(this._scoreLabel);
        this.updateScoreLabel();
    }

    public loadLevel(level: LevelDefinition) {
        this._level = new Level(new Size(640, 480), level.blocks);

        if (level.backdropImage == "level1") {
            this._backdropImage = this.resources.images.levels.level1;
        }

        for (let spawn of level.spawns) {
            this._entities.add(new EntitySpawner(spawn.location, spawn.size, this));
        }

        for (let g of level.gates) {
            let entrance = this.createGate(g.entrance, true);
            let exit = this.createGate(g.exit, false);

            entrance._matchingGate = exit;

            this._entities.add(entrance);
            this._entities.add(exit);
        }

        this._players = [
            new Player(level.player1Location.clone(), this._inputs.player1, 0, this),
            new Player(level.player2Location.clone(), this._inputs.player2, 1, this)];
    }

    private createGate(definition: GateDefinition, entrance: boolean): Gate {
        return new Gate(definition.location, definition.direction, entrance, this);
    }

    private spawnPrize() {
        let area = randomArrayElement(this._level.itemSpawnAreas);
        let x = randomInt(0, area.width - PriceEntity.size.height);

        let location = new Vector(area.x + x, area.y + area.height - PriceEntity.size.height);

        this._prize = new PrizeEntity(location, this);
        this._entities.add(this._prize);
    }

    public update(time: FrameTime) {
        this._time = time;

        for (let player of this._players) {
            player.update(time);
        }

        if (this._prize.disposed) {
            this.updateScoreLabel();
            this.spawnPrize();
        }

        if (this._players.filter(p => !p.entity.dead).length == 0) {
            this.reset(time);
        }

        this._entities.update(time);
        this._projectiles.update(time);
    }

    private updateScoreLabel() {
        this._scoreLabel.innerText = this._score.toString();
    }

    public addPoint() {
        this._score++;
        this.updateScoreLabel();
    }

    public render() {
        this.viewport.context.fillStyle = "pink";
        this.viewport.context.fillRect(0, 0, this.viewport.width, this.viewport.height);
        this.viewport.context.drawImage(this._backdropImage, 0, 0);
        //this._level.render(this.viewport);

        this._entities.render(this.viewport);
        this._projectiles.render(this.viewport);
    }

    private get viewport(): Viewport { return this._viewport; }

    public get time() { return this._time; }
    public get resources() { return this._resources; }
    public get level() { return this._level; }
    public get entityManager() { return this._entities; }
    public get particleSystem() { return this._projectiles; }
}