import { FrameTime } from "../../utilities/FrameTime";
import { Viewport } from "../../utilities/Viewport";
import { BoxSpawner } from "../BoxSpawner";
import { Game } from "../Game";
import { Highscores } from "../Highscores";
import { LevelSet } from "../Levels";
import { BoxCollectedEvent, GameEvent, IEventSink, PlayerDiedEvent } from "./Events";

export abstract class GameMode implements IEventSink {
    public readonly game: Game;

    public constructor(game: Game) {
        this.game = game;
    }

    public initializeGame(time: FrameTime): void { }

    public update(time: FrameTime): void { }
    public renderLabels(viewport: Viewport): void { }
    public renderOverlay(viewport: Viewport): void { }

    public handleEvent(gameEvent: GameEvent): void { }
}

export class SinglePlayerMode extends GameMode {
    private _score = 0;
    private _showGameOverScreenTime = 0;
    private _showGameOverScreen = false;
    private _unlockedNextLevel = false;
    private readonly _levels = new LevelSet();
    private _highScores = new Highscores();

    public constructor(game: Game) {
        super(game);
    }

    public override initializeGame(time: FrameTime): void {
        this.spawnBox();
    }

    public override update(time: FrameTime) {
        if (this._showGameOverScreen && time.currentTime - this._showGameOverScreenTime > 3000) {
            this.resetGame();
        }
    }

    public handleEvent(gameEvent: GameEvent): void {
        switch (gameEvent.type) {
            case BoxCollectedEvent.type:
                this._score++;
                this.spawnBox();
                console.log(`Score: ${this._score}`);
                break;

            case PlayerDiedEvent.type:
                this.gameOver();
                break;
        }
    }

    private gameOver() {
        this._showGameOverScreenTime = this.game.time.currentTime;
        this._showGameOverScreen = true;
        this._highScores.update(this.game.level.name, this._score);

        if (this._score >= 25) {
            this._unlockedNextLevel = this._levels.unlockNextLevel(this.game.levelDefinition);
        }
    }

    private resetGame() {
        this._showGameOverScreen = false;
        this.game.reset(this.game.time);
    }

    private spawnBox() {
        new BoxSpawner(this.game).spawn();
    }

    public override renderLabels(viewport: Viewport): void {
        if (!this._showGameOverScreen) {
            this.game.resources.fonts.default.renderCenteredInArea(viewport, this._score.toString(), 40, viewport.width);
        }
    }

    public override renderOverlay(viewport: Viewport): void {
        if (this._showGameOverScreen) {
            let highscore = this._highScores.get(this.game.level.name);

            this.game.resources.fonts.large.renderCenteredInArea(viewport, "GAME OVER", 220, viewport.width);

            if (highscore == null || this._score > highscore) {
                this.game.resources.fonts.small.renderCenteredInArea(viewport, `NEW HIGHSCORE ${this._score}!`, 250, viewport.width);
            } else {
                this.game.resources.fonts.small.renderCenteredInArea(viewport, `SCORE: ${this._score}`, 250, viewport.width);
                this.game.resources.fonts.small.renderCenteredInArea(viewport, `HIGH SCORE: ${highscore}`, 270, viewport.width);
            }

            if (this._unlockedNextLevel) {
                if (this.game.time.currentTime % 1000 < 500) {
                    this.game.resources.fonts.default.renderCenteredInArea(viewport, `NEXT LEVEL UNLOCKED!`, 340, viewport.width);
                }
            }
        }
    }
}