import { FrameCounter } from "./utilities/FrameCounter";
import { FrameTime } from "./utilities/FrameTime";
import { Size } from "./utilities/Trig";
import { Viewport } from "./utilities/Viewport";
import * as Dom from "./utilities/Dom";
import * as Align from "./utilities/Align";
import { ScreenManager } from "./utilities/ScreenManager";
import { GameScreen } from "./GameScreen";
import { GameContext } from "./GameContext";
import { createPlayer1InputProvider } from "./input/InputConfiguration";
import { Keyboard } from "./input/Keyboard";
import { GamepadPoller } from "./input/GamepadPoller";
import { ImageLoader } from "./utilities/ImagesLoader";
import { AudioLoader } from "./utilities/AudioLoader";

export interface ImageResources {
    apple: ImageBitmap;
}

export interface AudioResources {
    fire: HTMLAudioElement;
}

class Main {
    private _container: HTMLElement = null!;
    private _viewport: Viewport = null!;
    private _screenManager: ScreenManager = null!;
    private _fpsCounter = new FrameCounter();
    private _lastFrameTime = 0;

    private _keyboard = new Keyboard();
    private _gamepadPoller = new GamepadPoller();
    private _images: ImageResources = null!;
    private _audio: AudioResources = null!;

    public constructor(container: HTMLElement) {
        this._container = container;

    }

    public start() {
        this.requestAnimationFrame();

        this.fillWindow();

        window.addEventListener("resize", () => this.fillWindow());
    }

    public async initialize() {
        await this.loadResources();

        this._viewport = new Viewport(new Size(800, 600), this._container);

        const inputProvider = createPlayer1InputProvider(this._keyboard, this._gamepadPoller);
        const testScreen = new GameScreen(new GameContext(this._viewport, inputProvider, this._images, this._audio));
        this._screenManager = new ScreenManager(testScreen, new FrameTime(0, 0));
    }

    private async loadResources() {
        const imageLoader = new ImageLoader("assets/gfx");
        this._images = {
            apple: await imageLoader.load("red.png"),
        };

        const soundLoader = new AudioLoader("assets/sounds");
        this._audio = {
            fire: await soundLoader.load("fire.wav")
        };
    }

    private requestAnimationFrame() {
        requestAnimationFrame((time) => this.update(time));
    }

    private update(time: number): void {
        let frameTime = new FrameTime(time, time - this._lastFrameTime);

        this._screenManager.update(frameTime);
        this._screenManager.render();

        this._keyboard.nextFrame();
        this._fpsCounter.frame();
        this._lastFrameTime = time;

        this.requestAnimationFrame();
    }

    private fillWindow() {
        let windowSize = new Size(window.innerWidth, window.innerHeight);
        let scale = this._viewport.size.getScaleFactor(windowSize);
        let newSize = new Size(this._viewport.width * scale, this._viewport.height * scale);

        this._container.style.transformOrigin = "top left";
        this._container.style.transform = `scale(${scale})`;

        // Center the container in the window
        Dom.setLocation(this._container, Align.centerSizes(windowSize, newSize));
    }
}

async function initialize() {
    let main = new Main(document.getElementById("game")!);
    await main.initialize();
    main.start();
}

initialize();