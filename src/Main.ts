import { GameScreen } from "./GameScreen";
import { IntroScreen } from "./IntroScreen";
import { LevelSelectionScreen } from "./LevelSelectionScreen";
import { ResourceLoader, Resources } from "./Resources";
import { LevelDefinition } from "./game/LevelDefinition";
import { GamepadPoller } from "./input/GamepadPoller";
import { createPlayer1InputProvider, createPlayer2InputProvider } from "./input/InputConfiguration";
import { InputProvider } from "./input/InputProvider";
import { Keyboard } from "./input/Keyboard";
import * as Align from "./utilities/Align";
import { AudioSystem } from "./utilities/Audio";
import * as Dom from "./utilities/Dom";
import { FrameCounter } from "./utilities/FrameCounter";
import { FrameTime } from "./utilities/FrameTime";
import { ScreenManager } from "./utilities/ScreenManager";
import { Size } from "./utilities/Trig";
import { Viewport } from "./utilities/Viewport";

export interface Inputs {
    player1: InputProvider,
    player2: InputProvider
}

export interface IScreens {
    showIntro(time: FrameTime): void;
    showLevelSelect(time: FrameTime, level?: LevelDefinition): void;
    playGame(level: LevelDefinition, time: FrameTime): void;
}

export class Screens implements IScreens {
    public readonly screenManager: ScreenManager;
    public readonly intro: IntroScreen;
    public readonly levelSelection: LevelSelectionScreen;
    public readonly game: GameScreen;

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs, time: FrameTime) {
        this.levelSelection = new LevelSelectionScreen(viewport, resources, inputs, this);
        this.game = new GameScreen(viewport, resources, inputs, this);
        this.intro = new IntroScreen(viewport, resources, inputs, this);
        this.screenManager = new ScreenManager(this.intro, time);
    }

    public showIntro(time: FrameTime) {
        this.screenManager.changeScreen(this.intro, time);
    }

    public showLevelSelect(time: FrameTime, level?: LevelDefinition) {
        this.screenManager.changeScreen(this.levelSelection, time);

        if (level) {
            this.levelSelection.selectLevel(level);
        }
    }

    public playGame(level: LevelDefinition, time: FrameTime): void {
        this.game.loadLevel(level, time);
        this.screenManager.changeScreen(this.game, time);
    }
}

class Main {
    private _container: HTMLElement = null!;
    private _viewport: Viewport = null!;
    private _screens: Screens = null!;
    private _fpsCounter = new FrameCounter();
    private _lastFrameTime = 0;

    private _keyboard = new Keyboard();
    private _gamepadPoller = new GamepadPoller();
    private _inputs: Inputs;
    private _resources: Resources = null!;
    private _audioSystem = new AudioSystem();

    private readonly _fpsLabel: HTMLElement = document.getElementById("fps-label")!;

    public constructor(container: HTMLElement) {
        this._container = container;

        this._inputs = {
            player1: createPlayer1InputProvider(this._keyboard, this._gamepadPoller),
            player2: createPlayer2InputProvider(this._keyboard, this._gamepadPoller),
        };
    }

    public start() {
        this.requestAnimationFrame();

        this.fillWindow();

        window.addEventListener("resize", () => this.fillWindow());
    }

    public async initialize() {
        await this.loadResources();

        this._audioSystem.effectVolume = .1;
        this._audioSystem.musicVolume = .4;
        //this._audioSystem.effectsMuted = true;

        this._viewport = new Viewport(new Size(640, 480), this._container);

        this._screens = new Screens(this._viewport, this._resources, this._inputs, new FrameTime(0, 0));
    }

    private async loadResources() {
        let loader = new ResourceLoader(this._audioSystem);
        this._resources = await loader.load();
    }

    private requestAnimationFrame() {
        requestAnimationFrame((time) => this.update(time));
    }

    private update(time: number): void {
        let frameTime = new FrameTime(time, time - this._lastFrameTime);

        if (document.hasFocus() && !document.hidden) {
            this._screens.screenManager.update(frameTime);
        }
        this._screens.screenManager.render();

        this._keyboard.nextFrame();
        this._fpsCounter.frame();
        this._fpsLabel.innerText = `FPS: ${this._fpsCounter.fps}`;
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