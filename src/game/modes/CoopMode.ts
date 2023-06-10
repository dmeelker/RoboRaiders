import { FrameTime } from "../../utilities/FrameTime";
import { Viewport } from "../../utilities/Viewport";
import { BoxSpawner } from "../BoxSpawner";
import { Game } from "../Game";
import { Highscores } from "../Highscores";
import { LevelSet } from "../Levels";
import { WeaponProvider } from "../WeaponProvider";
import { Weapon } from "../weapons/Weapon";
import { BoxCollectedEvent, GameEvent, PlayerDiedEvent } from "./Events";
import { GameMode } from "./GameMode";

export class CoopMode extends GameMode {
    public get highscoreKey() { return "coop" }
    private _score = 0;
    private _showGameOverScreenTime = 0;
    private _showGameOverScreen = false;
    private _unlockedNextLevel = false;
    private readonly _levels = new LevelSet();
    private _highScores = new Highscores(this.highscoreKey);
    private readonly _weaponProvider: WeaponProvider;

    public constructor(game: Game) {
        super(game);
        this._weaponProvider = new WeaponProvider(game);
    }

    public override initializeGame(_time: FrameTime): void {
        this.game.playerCount = 2;
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
                this.boxCollected(gameEvent as BoxCollectedEvent);
                break;

            case PlayerDiedEvent.type:
                this.playerDied(gameEvent as PlayerDiedEvent);
                break;
        }
    }

    private boxCollected(event: BoxCollectedEvent) {
        this._score++;

        this.newWeapon(event);
        this.spawnBox();
    }

    private newWeapon(event: BoxCollectedEvent) {
        let weapon: Weapon;
        let newWeapon = false;

        if (this._score % 5 == 0 && this._weaponProvider.unlockableWeaponsLeft) {
            weapon = this._weaponProvider.unlockWeapon(event.player);
            newWeapon = true;
        } else {
            weapon = this._weaponProvider.getRandomWeapon(event.player);
        }

        event.player.equipWeapon(weapon, newWeapon);
    }

    private playerDied(_event: PlayerDiedEvent) {
        if (this.game.entityManager.getPlayers().filter(p => !p.dead).length == 0) {
            this.gameOver();
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