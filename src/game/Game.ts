import { Inputs, Resources } from "../Main";
import { FrameTime } from "../utilities/FrameTime";
import { ParticleSystem } from "../utilities/Particles";
import { Viewport } from "../utilities/Viewport";
import { Level } from "./Level";
import { Player } from "./Player";
import { EntityManager } from "./entities/EntityManager";
import { GravityGrenadeEntity } from "./entities/GravityGrenade";
import { BoxEntity } from "./entities/BoxEntity";
import { LevelLoader } from "./LevelLoader";
import { BoxSpawner } from "./BoxSpawner";
import * as Dom from "../utilities/Dom";

export interface IGameContext {
    get time(): FrameTime;
    get runTime(): number;
    get difficulty(): number;
    get resources(): Resources;
    get level(): Level;
    get entityManager(): EntityManager;
    get particleSystem(): ParticleSystem;
    get viewport(): Viewport;
    addPoint(): void;
}

export class Game implements IGameContext {
    private readonly _viewport: Viewport;
    private readonly _resources: Resources;
    private readonly _inputs: Inputs;
    private readonly _entities = new EntityManager();
    private readonly _projectiles = new ParticleSystem();
    private _startTime: number = 0;
    private _time: FrameTime = null!;
    private _level: Level = null!;
    private _backdropImage: ImageBitmap = null!;
    private _overlayImage: ImageBitmap = null!;

    private _score = 0;
    private _players: Array<Player> = null!;
    private _box: BoxEntity = null!;

    private _allPlayersDeadTime = 0;
    private _allPlayersDead = false;

    private _scoreLabel = document.createElement("div");
    private _gameOverLabel = document.createElement("div");

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs) {
        this._viewport = viewport;
        this._resources = resources;
        this._inputs = inputs;

        this._scoreLabel.className = "ui-label text-m";
        this._scoreLabel.style.textAlign = "center";
        this.viewport.uiElement.appendChild(this._scoreLabel);

        this._gameOverLabel.className = "ui-label text-l";
        this._gameOverLabel.style.textAlign = "center";
        this._gameOverLabel.innerHTML = "Game Over!";
        Dom.center(this._gameOverLabel);
        this.viewport.uiElement.appendChild(this._gameOverLabel);
    }

    public reset(time: FrameTime) {
        this._entities.clear();
        this._projectiles.clear();
        this.initialize(time);
    }

    public initialize(time: FrameTime) {
        this._startTime = time.currentTime;
        this._time = time;
        this._score = 0;

        this.loadLevel("level1");

        for (let player of this._players) {
            this._entities.add(player.entity);
        }
        this._allPlayersDead = false;
        Dom.hide(this._gameOverLabel);

        this.spawnBox();

        this.updateScoreLabel();
    }

    public loadLevel(level: string) {
        let levelLoader = new LevelLoader(this);
        levelLoader.loadLevel(level);

        this._players = [
            new Player(this._level.playerSpawnLocations[0].clone(), this._inputs.player1, 0, this)];

        // this._players = [
        //     new Player(this._level.playerSpawnLocations[0].clone(), this._inputs.player1, 0, this),
        //     new Player(this._level.playerSpawnLocations[1].clone(), this._inputs.player2, 1, this)];
    }

    private spawnBox() {
        this._box = new BoxSpawner(this).spawn();
    }

    public update(time: FrameTime) {
        this._time = time;

        for (let player of this._players) {
            player.update(time);
        }

        if (this._box.disposed) {
            this.updateScoreLabel();
            this.spawnBox();
        }

        if (!this._allPlayersDead && this._players.filter(p => !p.entity.dead).length == 0) {
            this._allPlayersDead = true;
            this._allPlayersDeadTime = time.currentTime;
            Dom.show(this._gameOverLabel);
        }

        if (this._allPlayersDead && time.currentTime - this._allPlayersDeadTime > 3000) {
            this.reset(time);
        }

        this._entities.update(time);
        GravityGrenadeEntity.updateGravityPull(this);
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

        this.viewport.context.drawImage(this._overlayImage, 0, 0);
    }

    public get time() { return this._time; }
    public get resources() { return this._resources; }
    public get level() { return this._level; }
    public get entityManager() { return this._entities; }
    public get particleSystem() { return this._projectiles; }
    public get viewport() { return this._viewport; }
    public get runTime() { return this._time.currentTime - this._startTime; }
    public get difficulty() { return Math.min(this._score / 50, 1); }

    public setLevel(level: Level, backdrop: ImageBitmap, overlay: ImageBitmap) {
        this._level = level;
        this._backdropImage = backdrop;
        this._overlayImage = overlay;
    }
}