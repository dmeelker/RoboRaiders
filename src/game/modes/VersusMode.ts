import { FrameTime } from "../../utilities/FrameTime";
import { Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { BoxSpawner } from "../BoxSpawner";
import { Game } from "../Game";
import { Highscores } from "../Highscores";
import { LevelSet } from "../Levels";
import { WeaponProvider } from "../WeaponProvider";
import { PlayerEntity } from "../entities/PlayerEntity";
import { Weapon } from "../weapons/Weapon";
import { BoxCollectedEvent, GameEvent, PlayerDiedEvent } from "./Events";
import { GameMode } from "./GameMode";

class VersusPlayer {
    public weaponProvider: WeaponProvider;
    public score = 0;

    public constructor(weaponProvider: WeaponProvider) {
        this.weaponProvider = weaponProvider;
    }
}

export class VersusMode extends GameMode {
    public get highscoreKey() { return "versus" }
    private _showGameOverScreenTime = 0;
    private _showGameOverScreen = false;
    private _unlockedNextLevel = false;
    private readonly _levels = new LevelSet();
    private _highScores = new Highscores(this.highscoreKey);
    private _players = [new VersusPlayer(new WeaponProvider(this.game)), new VersusPlayer(new WeaponProvider(this.game))];

    public constructor(game: Game) {
        super(game);
    }

    public override initializeGame(_time: FrameTime): void {
        this.game.playerCount = 2;
        this._showGameOverScreen = false;
        this._players = [new VersusPlayer(new WeaponProvider(this.game)), new VersusPlayer(new WeaponProvider(this.game))];
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
        this._players[event.player.index].score++;

        this.newWeapon(event.player);
        this.spawnBox();
    }

    private newWeapon(player: PlayerEntity) {
        let weapon: Weapon;
        let newWeapon = false;
        let versusPlayer = this._players[player.index];

        if (versusPlayer.score % 5 == 0 && versusPlayer.weaponProvider.unlockableWeaponsLeft) {
            weapon = versusPlayer.weaponProvider.unlockWeapon(player);
            newWeapon = true;
        } else {
            weapon = versusPlayer.weaponProvider.getRandomWeapon(player);
        }

        player.equipWeapon(weapon, newWeapon);
    }

    private playerDied(_event: PlayerDiedEvent) {
        this.gameOver();
    }

    private gameOver() {
        this._showGameOverScreenTime = this.game.time.currentTime;
        this._showGameOverScreen = true;

        this._highScores.update(this.game.level.name, this.getHighestScore());

        if (this.getHighestScore() >= 25) {
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
            this.game.resources.fonts.default.renderCenteredOnPoint(viewport, this._players[0].score.toString(), new Vector(320 / 2, 50));
            this.game.resources.fonts.default.renderCenteredOnPoint(viewport, this._players[1].score.toString(), new Vector(320 + (320 / 2), 50));
        }
    }

    public override renderOverlay(viewport: Viewport): void {
        if (this._showGameOverScreen) {
            let highscore = this._highScores.get(this.game.level.name);

            this.game.resources.fonts.large.renderCenteredInArea(viewport, "GAME OVER", 180, viewport.width);

            if (highscore == null || this.getHighestScore() > highscore) {
                this.game.resources.fonts.small.renderCenteredInArea(viewport, `NEW HIGHSCORE ${this.getHighestScore()}!`, 210, viewport.width);
            } else {
                this.game.resources.fonts.default.renderCenteredInArea(viewport, this.getWinnerMessage(), 220, viewport.width);
                this.game.resources.fonts.small.renderCenteredInArea(viewport, `P1 SCORE: ${this._players[0].score}`, 250, viewport.width);
                this.game.resources.fonts.small.renderCenteredInArea(viewport, `P2 SCORE: ${this._players[1].score}`, 270, viewport.width);
                this.game.resources.fonts.small.renderCenteredInArea(viewport, `HIGH SCORE: ${highscore}`, 290, viewport.width);
            }

            if (this._unlockedNextLevel) {
                if (this.game.time.currentTime % 1000 < 500) {
                    this.game.resources.fonts.default.renderCenteredInArea(viewport, `NEXT LEVEL UNLOCKED!`, 340, viewport.width);
                }
            }
        }
    }

    private getWinnerMessage(): string {
        if (this._players[0].score > this._players[1].score) {
            return "PLAYER 1 WINS!";
        } else if (this._players[1].score > this._players[0].score) {
            return "PLAYER 2 WINS!";
        } else {
            return "DRAW!";
        }
    }

    public getHighestScore() { return Math.max(this._players[0].score, this._players[1].score); }
}