import { Game } from "./game/Game";
import { LevelDefinition } from "./game/Levels";
import { Keys } from "./input/InputProvider";
import { FrameTime } from "./utilities/FrameTime";
import { Screen } from "./utilities/ScreenManager";

export class GameScreen extends Screen {
    private _game = new Game(this.viewport, this.resources, this.inputs);

    public activate(time: FrameTime): void {
        this._game.activate(time);
    }

    public deactivate(time: FrameTime): void {
        this._game.deactivate();
    }

    public loadLevel(level: LevelDefinition, time: FrameTime) {
        this._game.loadLevel(level, time);
    }

    public update(time: FrameTime): void {
        this._game.update(time);
        this.viewport.update(time);

        if (this.inputs.player1.wasButtonPressedInFrame(Keys.Menu)) {
            this._screens.showLevelSelect(time, this._game.levelDefinition);
        }
    }

    public render(): void {
        this._game.render();
    }
}
