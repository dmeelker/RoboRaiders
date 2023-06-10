import { Inputs } from "../Main";
import { Resources } from "../Resources";
import { FrameTime } from "../utilities/FrameTime";
import { ParticleSystem } from "../utilities/Particles";
import { Viewport } from "../utilities/Viewport";
import { Level } from "./Level";
import { LevelDefinition } from "./LevelDefinition";
import { LevelLoader } from "./LevelLoader";
import { EntityManager } from "./entities/EntityManager";
import { GravityGrenadeEntity } from "./entities/GravityGrenade";
import { Facing, PlayerEntity } from "./entities/PlayerEntity";
import { IEventSink } from "./modes/Events";
import { SinglePlayerMode } from "./modes/SinglePlayerMode";
import { GameMode } from "./modes/GameMode";
import { CoopMode } from "./modes/CoopMode";

export interface IGameContext {
    get debugMode(): boolean;
    get time(): FrameTime;
    get runTime(): number;
    get difficulty(): number;
    get resources(): Resources;
    get level(): Level;
    get entityManager(): EntityManager;
    get particleSystem(): ParticleSystem;
    get viewport(): Viewport;
    addPoint(): number;
    get eventSink(): IEventSink;
    get playerCount(): number;
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
    private _levelDefinition: LevelDefinition = null!;
    private _backdropImage: ImageBitmap = null!;
    private _overlayImage: ImageBitmap = null!;

    private _score = 0;
    private _playerCount = 1;
    private _players: Array<PlayerEntity> = null!;

    private _mode: GameMode = new CoopMode(this);
    public set mode(value: GameMode) { this._mode = value; }

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs) {
        this._viewport = viewport;
        this._resources = resources;
        this._inputs = inputs;
    }

    public update(time: FrameTime) {
        this._time = time;
        this._mode.update(time);

        this._entities.update(time);
        GravityGrenadeEntity.updateGravityPull(this);
        this._projectiles.update(time);
    }

    public reset(time: FrameTime) {
        this.loadLevel(this._levelDefinition, time);
    }

    public loadLevel(level: LevelDefinition, time: FrameTime) {
        this._entities.clear();
        this._projectiles.clear();

        this._startTime = time.currentTime;
        this._time = time;
        this._score = 0;

        this.loadLevelData(level);
        this._mode.initializeGame(time);
        this.initializePlayers();
    }

    private initializePlayers() {
        if (this._playerCount == 1) {
            this._players = [
                new PlayerEntity(this._level.playerSpawnLocations[0].clone(), this._inputs.player1solo, 0, this)
            ];
        } else if (this._playerCount == 2) {
            this._players = [
                new PlayerEntity(this._level.playerSpawnLocations[0].clone(), this._inputs.player1, 0, this),
                new PlayerEntity(this._level.playerSpawnLocations[1].clone(), this._inputs.player2, 1, this)
            ];

            this._players[0].facing = Facing.Left;
            this._players[1].facing = Facing.Right;
        }

        for (let player of this._players) {
            this._entities.add(player);
        }
    }

    private loadLevelData(level: LevelDefinition) {
        this._levelDefinition = level;
        let levelLoader = new LevelLoader(this);
        levelLoader.loadLevel(level);

    }

    public addPoint(): number {
        this._score++;
        return this._score;
    }

    public render() {
        this.viewport.context.fillStyle = "pink";
        this.viewport.context.fillRect(0, 0, this.viewport.width, this.viewport.height);
        this.viewport.context.drawImage(this._backdropImage, 0, 0);

        this._mode.renderLabels(this.viewport);

        this.renderControls();

        this._entities.render(this.viewport);
        this._projectiles.render(this.viewport);

        this.viewport.context.drawImage(this._overlayImage, 0, 0);

        this._mode.renderOverlay(this.viewport);
    }

    private renderControls() {
        if (this.showControls) {
            this.resources.fonts.small.renderCenteredInArea(this.viewport, "HOW TO PLAY", 200, this.viewport.width);
            if (this.playerCount == 1) {
                this.resources.fonts.small.renderCenteredInArea(this.viewport, "ARROW KEYS  MOVE", 220, this.viewport.width);
                this.resources.fonts.small.renderCenteredInArea(this.viewport, "Z   JUMP", 240, this.viewport.width);
                this.resources.fonts.small.renderCenteredInArea(this.viewport, "X   SHOOT", 260, this.viewport.width);
            } else {
                this.resources.fonts.small.renderCenteredInArea(this.viewport, "P1 ARROW KEYS  COMMA  PERIOD", 220, this.viewport.width);
                this.resources.fonts.small.renderCenteredInArea(this.viewport, "P2 WSAD  F  G", 240, this.viewport.width);
            }
        }
    }

    public get time() { return this._time; }
    public get resources() { return this._resources; }
    public get level() { return this._level; }
    public get entityManager() { return this._entities; }
    public get particleSystem() { return this._projectiles; }
    public get viewport() { return this._viewport; }
    public get runTime() { return this._time.currentTime - this._startTime; }
    public get difficulty() { return Math.min(this._score / 50, 1); }
    public get debugMode() { return false; }
    public get eventSink() { return this._mode; }
    public set playerCount(value: number) { this._playerCount = value; }
    public get playerCount() { return this._playerCount; }

    public get levelDefinition() { return this._levelDefinition; }
    public get showControls() {
        if (this._score > 0)
            return false;

        for (let player of this._players) {
            if (this._time.currentTime - player.lastMoveTime < 5000 &&
                this._time.currentTime - player.lastActionTime < 5000) {
                return false;
            }
        }
        return true;
    }

    public setLevel(level: Level, backdrop: ImageBitmap, overlay: ImageBitmap) {
        this._level = level;
        this._backdropImage = backdrop;
        this._overlayImage = overlay;
    }
}