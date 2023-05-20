import { FrameCounter } from "./utilities/FrameCounter";
import { FrameTime } from "./utilities/FrameTime";
import { Size } from "./utilities/Trig";
import { Viewport } from "./utilities/Viewport";
import * as Dom from "./utilities/Dom";
import * as Align from "./utilities/Align";
import { ScreenManager } from "./utilities/ScreenManager";
import { GameScreen } from "./GameScreen";
import { createPlayer1InputProvider, createPlayer2InputProvider } from "./input/InputConfiguration";
import { Keyboard } from "./input/Keyboard";
import { GamepadPoller } from "./input/GamepadPoller";
import { ImageLoader } from "./utilities/ImagesLoader";
import { AudioLoader } from "./utilities/AudioLoader";
import { SpriteSheetLoader } from "./utilities/SpriteSheetLoader";
import { AnimationDefinition } from "./utilities/Animation";
import { InputProvider } from "./input/InputProvider";

export interface ImageResources {
    crate: ImageBitmap,
    pistol: ImageBitmap,
    machinegun: ImageBitmap,
    shotgun: ImageBitmap,
    rpg: ImageBitmap,
    rpgGrenade: ImageBitmap,

    levels: LevelBackdrops
}

export interface LevelBackdrops {
    level1: ImageBitmap;
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
    player1JumpLeft: AnimationDefinition,

    player2StandRight: AnimationDefinition,
    player2WalkRight: AnimationDefinition,
    player2JumpRight: AnimationDefinition,
    player2StandLeft: AnimationDefinition,
    player2WalkLeft: AnimationDefinition,
    player2JumpLeft: AnimationDefinition,

    runnerBotStandRight: AnimationDefinition,
    runnerBotStandLeft: AnimationDefinition,
    runnerBotWalkRight: AnimationDefinition,
    runnerBotWalkLeft: AnimationDefinition,
    runnerBotJumpRight: AnimationDefinition,
    runnerBotJumpLeft: AnimationDefinition
}

export class Resources {
    public constructor(
        public readonly images: ImageResources,
        public readonly audio: AudioResources,
        public readonly animations: AnimationResources) { }
}

export interface Inputs {
    player1: InputProvider,
    player2: InputProvider
}

class Main {
    private _container: HTMLElement = null!;
    private _viewport: Viewport = null!;
    private _screenManager: ScreenManager = null!;
    private _fpsCounter = new FrameCounter();
    private _lastFrameTime = 0;

    private _keyboard = new Keyboard();
    private _gamepadPoller = new GamepadPoller();
    private _inputs: Inputs;
    private _resources: Resources = null!;

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

        this._viewport = new Viewport(new Size(640, 480), this._container);

        const testScreen = new GameScreen(this._viewport, this._resources, this._inputs);
        this._screenManager = new ScreenManager(testScreen, new FrameTime(0, 0));
    }

    private async loadResources() {
        const imageLoader = new ImageLoader("assets/gfx");
        let images = {
            crate: await imageLoader.load("crate.png"),
            pistol: await imageLoader.load("weapons/pistol.png"),
            machinegun: await imageLoader.load("weapons/machinegun.png"),
            shotgun: await imageLoader.load("weapons/shotgun.png"),
            rpg: await imageLoader.load("weapons/rpg.png"),
            rpgGrenade: await imageLoader.load("weapons/rpg_grenade.png"),

            levels: {
                level1: await imageLoader.load("levels/level1.png"),
            },
            player1StandRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_stand_right.png"), 1, 1),
            player1WalkRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_walk_right.png"), 4, 1),
            player1JumpRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_jump_right.png"), 1, 1),
            player1StandLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_stand_left.png"), 1, 1),
            player1WalkLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_walk_left.png"), 4, 1),
            player1JumpLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player1_jump_left.png"), 1, 1),

            player2StandRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player2_stand_right.png"), 1, 1),
            player2WalkRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player2_walk_right.png"), 4, 1),
            player2JumpRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player2_jump_right.png"), 1, 1),
            player2StandLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player2_stand_left.png"), 1, 1),
            player2WalkLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player2_walk_left.png"), 4, 1),
            player2JumpLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("player2_jump_left.png"), 1, 1),

            runnerBotStandRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_stand_right.png"), 4, 1),
            runnerBotStandLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_stand_left.png"), 4, 1),
            runnerBotWalkRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_walk_right.png"), 4, 1),
            runnerBotWalkLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_walk_left.png"), 4, 1),
            runnerBotJumpRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_jump_right.png"), 1, 1),
            runnerBotJumpLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_jump_left.png"), 1, 1),
        };

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

            player2StandRight: new AnimationDefinition(images.player2StandRight, 1),
            player2WalkRight: new AnimationDefinition(images.player2WalkRight, 150),
            player2JumpRight: new AnimationDefinition(images.player2JumpRight, 1),
            player2StandLeft: new AnimationDefinition(images.player2StandLeft, 1),
            player2WalkLeft: new AnimationDefinition(images.player2WalkLeft, 150),
            player2JumpLeft: new AnimationDefinition(images.player2JumpLeft, 1),

            runnerBotStandRight: new AnimationDefinition(images.runnerBotStandRight, 1),
            runnerBotStandLeft: new AnimationDefinition(images.runnerBotStandLeft, 1),
            runnerBotWalkRight: new AnimationDefinition(images.runnerBotWalkRight, 150),
            runnerBotWalkLeft: new AnimationDefinition(images.runnerBotWalkLeft, 150),
            runnerBotJumpRight: new AnimationDefinition(images.runnerBotJumpRight, 1),
            runnerBotJumpLeft: new AnimationDefinition(images.runnerBotJumpLeft, 1),
        };

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