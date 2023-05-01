import { FrameCounter } from "./utilities/FrameCounter";
import { FrameTime } from "./utilities/FrameTime";
import { Size } from "./utilities/Trig";
import { Viewport } from "./utilities/Viewport";
import * as Dom from "./utilities/Dom";
import * as Align from "./utilities/Align";
import { ScreenManager } from "./utilities/ScreenManager";
import { GameScreen } from "./GameScreen";
import { createPlayer1InputProvider } from "./input/InputConfiguration";
import { Keyboard } from "./input/Keyboard";
import { GamepadPoller } from "./input/GamepadPoller";
import { ImageLoader } from "./utilities/ImagesLoader";
import { AudioLoader } from "./utilities/AudioLoader";
import { SpriteSheetLoader } from "./utilities/SpriteSheetLoader";
import { AnimationDefinition } from "./utilities/Animation";

export interface ImageResources {
    shotgun: ImageBitmap,
    player1StandRight: Array<ImageBitmap>;
    player1WalkRight: Array<ImageBitmap>;
    player1JumpRight: Array<ImageBitmap>;
}

export interface AudioResources {
    fire: HTMLAudioElement;
}

export interface AnimationResources {
    player1StandRight: AnimationDefinition,
    player1WalkRight: AnimationDefinition,
    player1JumpRight: AnimationDefinition,
    player1StandLeft: AnimationDefinition,
    player1WalkLeft: AnimationDefinition,
    player1JumpLeft: AnimationDefinition
}

export class Resources {
    public constructor(
        public readonly images: ImageResources,
        public readonly audio: AudioResources,
        public readonly animations: AnimationResources) { }
}

class Main {
    private _container: HTMLElement = null!;
    private _viewport: Viewport = null!;
    private _screenManager: ScreenManager = null!;
    private _fpsCounter = new FrameCounter();
    private _lastFrameTime = 0;

    private _keyboard = new Keyboard();
    private _gamepadPoller = new GamepadPoller();
    private _resources: Resources = null!;

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

        this._viewport = new Viewport(new Size(640, 480), this._container);

        const inputProvider = createPlayer1InputProvider(this._keyboard, this._gamepadPoller);
        const testScreen = new GameScreen(this._viewport, this._resources, inputProvider);
        this._screenManager = new ScreenManager(testScreen, new FrameTime(0, 0));
    }

    private async loadResources() {
        const imageLoader = new ImageLoader("assets/gfx");
        let images = {
            shotgun: await imageLoader.load("weapons/shotgun.png"),
            player1StandRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_stand_right.png"), 1, 1),
            player1WalkRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_walk_right.png"), 4, 1),
            player1JumpRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_jump_right.png"), 1, 1),

            player1StandLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_stand_left.png"), 1, 1),
            player1WalkLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_walk_left.png"), 4, 1),
            player1JumpLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_jump_left.png"), 1, 1),
        };
        console.log(images);
        const soundLoader = new AudioLoader("assets/sounds");
        let audio = {
            fire: await soundLoader.load("fire.wav")
        };

        let animations = {
            player1StandRight: new AnimationDefinition(images.player1StandRight, 1),
            player1WalkRight: new AnimationDefinition(images.player1WalkRight, 150),
            player1JumpRight: new AnimationDefinition(images.player1JumpRight, 1),

            player1StandLeft: new AnimationDefinition(images.player1StandLeft, 1),
            player1WalkLeft: new AnimationDefinition(images.player1WalkLeft, 150),
            player1JumpLeft: new AnimationDefinition(images.player1JumpLeft, 1),
        };

        console.log(animations);

        this._resources = new Resources(images, audio, animations);
    }

    private requestAnimationFrame() {
        requestAnimationFrame((time) => this.update(time));
    }

    private update(time: number): void {
        let frameTime = new FrameTime(time, time - this._lastFrameTime);

        if (document.hasFocus() && !document.hidden) {
            this._screenManager.update(frameTime);
        } else {
            document.title = `Paused`;
        }
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