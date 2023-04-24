import { GameContext } from "../GameContext";
import { AudioResources, ImageResources } from "../Main";
import { InputProvider } from "../input/InputProvider";
import { FrameTime } from "./FrameTime";
import { Viewport } from "./Viewport";

export abstract class Screen {
    protected _context: GameContext;

    public constructor(context: GameContext) {
        this._context = context;
    }

    public activate(_time: FrameTime): void { }
    public deactivate(_time: FrameTime): void { }

    public abstract update(time: FrameTime): void;
    public abstract render(): void;

    protected get viewport(): Viewport { return this._context.viewport; }
    protected get input(): InputProvider { return this._context.input; }
    protected get images(): ImageResources { return this._context.images; }
    protected get audio(): AudioResources { return this._context.audio; }
}

export class ScreenManager {
    private _activeScreen: Screen;

    public constructor(activeScreen: Screen, time: FrameTime) {
        this._activeScreen = activeScreen;
        this.activateScreen(activeScreen, time);
    }

    public changeScreen(newScreen: Screen, time: FrameTime) {
        this.deactivateScreen(this._activeScreen, time);
        this._activeScreen = newScreen;
        this.activateScreen(newScreen, time);
    }

    private activateScreen(screen: Screen, time: FrameTime) {
        screen.activate(time);
    }

    private deactivateScreen(screen: Screen, time: FrameTime) {
        screen.deactivate(time);
    }

    public update(time: FrameTime) {
        this._activeScreen.update(time);
    }

    public render() {
        this._activeScreen.render();
    }

    public get activeScreen(): Screen { return this._activeScreen; }
}
