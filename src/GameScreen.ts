import { Game } from "./game/Game";
import { LevelDefinition } from "./game/LevelDefinition";
import { CoopMode } from "./game/modes/CoopMode";
import { SinglePlayerMode } from "./game/modes/SinglePlayerMode";
import { VersusMode } from "./game/modes/VersusMode";
import { Keys } from "./input/InputProvider";
import { FrameTime } from "./utilities/FrameTime";
import { Screen } from "./utilities/ScreenManager";

export class GameScreen extends Screen {
    private _mode: string = "singleplayer";
    private _game = new Game(this.viewport, this.resources, this.inputs);

    public loadLevel(level: LevelDefinition, mode: string, time: FrameTime) {
        this._mode = mode;
        this._game = new Game(this.viewport, this.resources, this.inputs);

        switch (mode) {
            case "singleplayer":
                this._game.mode = new SinglePlayerMode(this._game);
                break;
            case "coop":
                this._game.mode = new CoopMode(this._game);
                break;
            case "versus":
                this._game.mode = new VersusMode(this._game);
                break;
            default:
                throw new Error(`Unknown mode: ${mode}`);
        }

        this._game.mode
        this._game.loadLevel(level, time);
    }

    public update(time: FrameTime): void {
        this._game.update(time);
        this.viewport.update(time);

        if (this.inputs.player1.wasButtonPressedInFrame(Keys.Menu)) {
            this._screens.showLevelSelect(time, this._mode, this._game.levelDefinition);
        }
    }

    public render(): void {
        this._game.render();
    }
}
