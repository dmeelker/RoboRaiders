import { FrameTime } from "./utilities/FrameTime";
import { Size } from "./utilities/Trig";
import { Viewport } from "./utilities/Viewport";

export abstract class Screen {
    protected _viewport: Viewport;

    public constructor(viewport: Viewport) {
        this._viewport = viewport;
    }

    public abstract update(time: FrameTime): void;
    public abstract render(): void;

    protected get viewport(): Viewport { return this._viewport; }
}

class TestScreen extends Screen {
    public update(time: FrameTime): void {

    }

    public render(): void {
        this.viewport.clearCanvas();
    }

}

export class ScreenManager {
    private _activeScreen: Screen;

    public constructor(activeScreen: Screen) {
        this._activeScreen = activeScreen;
        this.activateScreen(activeScreen);
    }

    public changeScreen(newScreen: Screen) {
        this.deactivateScreen(this._activeScreen);
        this._activeScreen = newScreen;
        this.activateScreen(newScreen);
    }

    private activateScreen(screen: Screen) {

    }

    private deactivateScreen(screen: Screen) {

    }

    public update(time: FrameTime) {
        this._activeScreen.update(time);
    }

    public render() {
        this._activeScreen.render();
    }

    public get activeScreen(): Screen { return this._activeScreen; }
}

let container = document.getElementById("game");
let viewport = new Viewport(new Size(800, 600), container);

let testScreen = new TestScreen(viewport);
let screenManager = new ScreenManager(testScreen);