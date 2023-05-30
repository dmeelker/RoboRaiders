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
import { Highscores } from "./Highscores";
import { LevelDefinition } from "./Levels";

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
    private _levelDefinition: LevelDefinition = null!;
    private _backdropImage: ImageBitmap = null!;
    private _overlayImage: ImageBitmap = null!;

    private _score = 0;
    private _players: Array<Player> = null!;
    private _box: BoxEntity = null!;
    private _highScores = new Highscores();

    private _allPlayersDeadTime = 0;
    private _allPlayersDead = false;

    private _scoreLabel = document.createElement("div");
    private _gameOverPanel = document.createElement("div");
    private _gameOverLabel = document.createElement("div");
    private _gameOverScoreLabel = document.createElement("div");

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs) {
        this._viewport = viewport;
        this._resources = resources;
        this._inputs = inputs;

        this._scoreLabel.className = "ui-label text-m";
        this._scoreLabel.style.textAlign = "center";


        this._gameOverLabel.className = "ui-label text-l";
        this._gameOverLabel.style.textAlign = "center";
        this._gameOverLabel.innerHTML = "Game Over!";

        this._gameOverScoreLabel.className = "ui-label text-s";
        this._gameOverScoreLabel.style.textAlign = "center";

        this._gameOverPanel.appendChild(this._gameOverLabel);
        this._gameOverPanel.appendChild(this._gameOverScoreLabel);


    }

    public activate(time: FrameTime) {
        // this._startTime = time.currentTime;
        // this._time = time;
        // this._score = 0;

        this.viewport.uiElement.appendChild(this._scoreLabel);
        this.viewport.uiElement.appendChild(this._gameOverPanel);
        Dom.center(this._gameOverPanel);

        this.reset(time);

        // this.loadLevel("level1");

        // for (let player of this._players) {
        //     this._entities.add(player.entity);
        // }
        // this._allPlayersDead = false;

        // this.spawnBox();

        // this.updateScoreLabel();
    }

    public deactivate() {
        this.viewport.uiElement.removeChild(this._scoreLabel);
        this.viewport.uiElement.removeChild(this._gameOverPanel);
    }

    private loadLevelData(level: LevelDefinition) {
        this._levelDefinition = level;
        let levelLoader = new LevelLoader(this);
        levelLoader.loadLevel(level.code);

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

            this.showGameOver(time);
        }

        if (this._allPlayersDead && time.currentTime - this._allPlayersDeadTime > 3000) {
            this.gameOver(time);
        }

        this._entities.update(time);
        GravityGrenadeEntity.updateGravityPull(this);
        this._projectiles.update(time);
    }

    public showGameOver(time: FrameTime) {
        let highscore = this._highScores.get(this._level.name);

        if (highscore == null || this._score > highscore) {
            this._gameOverScoreLabel.innerText = `${this._score} point, new highscore!`;
        } else {
            Dom.clear(this._gameOverScoreLabel);
            this._gameOverScoreLabel.appendChild(Dom.createDiv(`Score: ${this._score}`));
            this._gameOverScoreLabel.appendChild(Dom.createDiv(`High score: ${highscore}`));
        }
        Dom.show(this._gameOverPanel);
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

        Dom.hide(this._gameOverPanel);
        Dom.center(this._gameOverPanel);

        this.loadLevelData(level);

        for (let player of this._players) {
            this._entities.add(player.entity);
        }
        this._allPlayersDead = false;

        this.spawnBox();

        this.updateScoreLabel();
    }

    private updateScoreLabel() {
        this._scoreLabel.innerText = this._score.toString();

        this._scoreLabel.classList.add("pulse");
        let highscore = this._highScores.get(this._level.name);
        Dom.setClass(this._scoreLabel, "highscore", highscore == undefined || this._score > highscore);

        window.setTimeout(() => this._scoreLabel.classList.remove("pulse"), 200);
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

    public get levelDefinition() { return this._levelDefinition; }

    public setLevel(level: Level, backdrop: ImageBitmap, overlay: ImageBitmap) {
        this._level = level;
        this._backdropImage = backdrop;
        this._overlayImage = overlay;
    }
}