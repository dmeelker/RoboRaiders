import { Inputs } from "../Main";
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
import { Highscores } from "./Highscores";
import { LevelDefinition } from "./LevelDefinition";
import { Resources } from "../Resources";

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
    private _players: Array<Player> = null!;
    private _box: BoxEntity = null!;
    private _highScores = new Highscores();

    private _showGameOverScreenTime = 0;
    private _showGameOverScreen = false;

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs) {
        this._viewport = viewport;
        this._resources = resources;
        this._inputs = inputs;
    }

    public update(time: FrameTime) {
        this._time = time;

        for (let player of this._players) {
            player.update(time);
        }

        if (this._box.disposed) {
            this.spawnBox();
        }

        if (!this._showGameOverScreen && this.allPlayersDead) {
            this._showGameOverScreen = true;
            this._showGameOverScreenTime = time.currentTime;
        }

        if (this._showGameOverScreen && time.currentTime - this._showGameOverScreenTime > 3000) {
            this.gameOver(time);
        }

        this._entities.update(time);
        GravityGrenadeEntity.updateGravityPull(this);
        this._projectiles.update(time);
    }

    private gameOver(time: FrameTime) {
        this._highScores.update(this._level.name, this._score);
        this.reset(time);
    }

    private reset(time: FrameTime) {
        this.loadLevel(this._levelDefinition, time);
    }

    public loadLevel(level: LevelDefinition, time: FrameTime) {
        this._entities.clear();
        this._projectiles.clear();

        this._startTime = time.currentTime;
        this._time = time;
        this._score = 0;
        this._showGameOverScreen = false;

        this.loadLevelData(level);

        for (let player of this._players) {
            this._entities.add(player.entity);
        }

        this.spawnBox();
    }

    private loadLevelData(level: LevelDefinition) {
        this._levelDefinition = level;
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

    public addPoint(): number {
        this._score++;
        return this._score;
    }

    public render() {
        this.viewport.context.fillStyle = "pink";
        this.viewport.context.fillRect(0, 0, this.viewport.width, this.viewport.height);
        this.viewport.context.drawImage(this._backdropImage, 0, 0);
        //this._level.render(this.viewport);

        this.renderControls();


        this._entities.render(this.viewport);
        this._projectiles.render(this.viewport);

        this.viewport.context.drawImage(this._overlayImage, 0, 0);

        this.renderLabels();
    }

    private renderLabels() {
        if (this._showGameOverScreen) {
            let highscore = this._highScores.get(this._level.name);

            this.resources.fonts.large.renderCenteredInArea(this.viewport, "GAME OVER", 220, this.viewport.width);

            if (highscore == null || this._score > highscore) {
                this.resources.fonts.small.renderCenteredInArea(this.viewport, `NEW HIGHSCORE ${this._score}!`, 250, this.viewport.width);
            } else {
                this.resources.fonts.small.renderCenteredInArea(this.viewport, `SCORE: ${this._score}`, 250, this.viewport.width);
                this.resources.fonts.small.renderCenteredInArea(this.viewport, `HIGH SCORE: ${highscore}`, 270, this.viewport.width);
            }
        } else {
            this.resources.fonts.default.renderCenteredInArea(this.viewport, this._score.toString(), 40, this.viewport.width);
        }
    }

    private renderControls() {
        if (this.showControls) {
            this.resources.fonts.small.renderCenteredInArea(this.viewport, "HOW TO PLAY", 200, this.viewport.width);
            this.resources.fonts.small.renderCenteredInArea(this.viewport, "ARROW KEYS  MOVE", 220, this.viewport.width);
            this.resources.fonts.small.renderCenteredInArea(this.viewport, "Z   JUMP", 240, this.viewport.width);
            this.resources.fonts.small.renderCenteredInArea(this.viewport, "X   SHOOT", 260, this.viewport.width);
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

    public get levelDefinition() { return this._levelDefinition; }
    public get showControls() {
        if (this._score > 0)
            return false;

        for (let player of this._players) {
            if (this._time.currentTime - player.entity.lastMoveTime < 5000 &&
                this._time.currentTime - player.entity.lastActionTime < 5000) {
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

    private get allPlayersDead() { return this._players.filter(p => !p.entity.dead).length == 0; }
}