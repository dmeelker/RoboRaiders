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
import { LevelSelectionScreen } from "./LevelSelectionScreen";
import { LevelDefinition } from "./game/Levels";
import { Font } from "./Font";

export interface ImageResources {
    background: ImageBitmap,

    crate: ImageBitmap,
    bullet: ImageBitmap,
    pistol: ImageBitmap,
    machinegun: ImageBitmap,
    shotgun: ImageBitmap,
    rpg: ImageBitmap,
    rpgGrenade: ImageBitmap,
    railgun: ImageBitmap,
    railgunLoaded: ImageBitmap,
    dart: ImageBitmap,
    gravityGrenadeUnarmed: ImageBitmap,
    gravityGrenadeArmed: ImageBitmap,

    levels: { [id: string]: LevelImages };
}

export interface LevelImages {
    backdrop: ImageBitmap;
    overlay: ImageBitmap;
    metadata: ImageBitmap;
    thumbnail: ImageBitmap;
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
    runnerBotHitRight: AnimationDefinition,
    runnerBotHitLeft: AnimationDefinition,

    rollerBotStandRight: AnimationDefinition,
    rollerBotStandLeft: AnimationDefinition,
    rollerBotWalkRight: AnimationDefinition,
    rollerBotWalkLeft: AnimationDefinition,
    rollerBotJumpRight: AnimationDefinition,
    rollerBotJumpLeft: AnimationDefinition,
    rollerBotHitRight: AnimationDefinition,
    rollerBotHitLeft: AnimationDefinition,

    fastBotStandRight: AnimationDefinition,
    fastBotStandLeft: AnimationDefinition,
    fastBotWalkRight: AnimationDefinition,
    fastBotWalkLeft: AnimationDefinition,
    fastBotJumpRight: AnimationDefinition,
    fastBotJumpLeft: AnimationDefinition,
    fastBotHitRight: AnimationDefinition,
    fastBotHitLeft: AnimationDefinition,
}

export interface Fonts {
    small: Font;
    default: Font;
    large: Font;
}

export class Resources {
    public constructor(
        public readonly images: ImageResources,
        public readonly audio: AudioResources,
        public readonly animations: AnimationResources,
        public readonly fonts: Fonts) { }
}

export interface Inputs {
    player1: InputProvider,
    player2: InputProvider
}

export interface IScreens {
    showLevelSelect(time: FrameTime, level?: LevelDefinition): void;
    playGame(level: LevelDefinition, time: FrameTime): void;
}

export class Screens implements IScreens {
    public readonly screenManager: ScreenManager;
    public readonly levelSelection: LevelSelectionScreen;
    public readonly game: GameScreen;

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs, time: FrameTime) {
        this.levelSelection = new LevelSelectionScreen(viewport, resources, inputs, this);
        this.game = new GameScreen(viewport, resources, inputs, this);

        this.screenManager = new ScreenManager(this.levelSelection, time);
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

        this._screens = new Screens(this._viewport, this._resources, this._inputs, new FrameTime(0, 0));
    }

    private async loadResources() {
        const imageLoader = new ImageLoader("assets/gfx");
        let images = {
            background: await imageLoader.load("background.png"),
            crate: await imageLoader.load("crate.png"),
            bullet: await imageLoader.load("weapons/bullet.png"),
            pistol: await imageLoader.load("weapons/pistol.png"),
            machinegun: await imageLoader.load("weapons/machinegun.png"),
            shotgun: await imageLoader.load("weapons/shotgun.png"),
            rpg: await imageLoader.load("weapons/rpg.png"),
            rpgGrenade: await imageLoader.load("weapons/rpg_grenade.png"),
            railgun: await imageLoader.load("weapons/railgun.png"),
            railgunLoaded: await imageLoader.load("weapons/railgun_loaded.png"),
            dart: await imageLoader.load("weapons/dart.png"),
            gravityGrenadeUnarmed: await imageLoader.load("weapons/gravity_grenade_unarmed.png"),
            gravityGrenadeArmed: await imageLoader.load("weapons/gravity_grenade_armed.png"),

            levels: {
                level1: await this.loadLevelImages("level1", imageLoader),
                level2: await this.loadLevelImages("level2", imageLoader),
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

            runnerBotStandRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_stand_right.png"), 1, 1),
            runnerBotStandLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_stand_left.png"), 1, 1),
            runnerBotWalkRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_walk_right.png"), 4, 1),
            runnerBotWalkLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_walk_left.png"), 4, 1),
            runnerBotJumpRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_jump_right.png"), 1, 1),
            runnerBotJumpLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_jump_left.png"), 1, 1),
            runnerBotHitRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_hit_right.png"), 1, 1),
            runnerBotHitLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("runner_bot_hit_left.png"), 1, 1),

            rollerBotStandRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("roller_bot_stand_right.png"), 1, 1),
            rollerBotStandLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("roller_bot_stand_left.png"), 1, 1),
            rollerBotWalkRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("roller_bot_walk_right.png"), 2, 1),
            rollerBotWalkLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("roller_bot_walk_left.png"), 2, 1),
            rollerBotJumpRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("roller_bot_jump_right.png"), 1, 1),
            rollerBotJumpLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("roller_bot_jump_left.png"), 1, 1),
            rollerBotHitRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("roller_bot_hit_right.png"), 1, 1),
            rollerBotHitLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("roller_bot_hit_left.png"), 1, 1),

            fastBotStandRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("fast_bot_stand_right.png"), 1, 1),
            fastBotStandLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("fast_bot_stand_left.png"), 1, 1),
            fastBotWalkRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("fast_bot_walk_right.png"), 3, 1),
            fastBotWalkLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("fast_bot_walk_left.png"), 3, 1),
            fastBotJumpRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("fast_bot_jump_right.png"), 1, 1),
            fastBotJumpLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("fast_bot_jump_left.png"), 1, 1),
            fastBotHitRight: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("fast_bot_hit_right.png"), 1, 1),
            fastBotHitLeft: await new SpriteSheetLoader().cutSpriteSheet(await imageLoader.load("fast_bot_hit_left.png"), 1, 1),
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
            runnerBotHitRight: new AnimationDefinition(images.runnerBotHitRight, 1),
            runnerBotHitLeft: new AnimationDefinition(images.runnerBotHitLeft, 1),

            rollerBotStandRight: new AnimationDefinition(images.rollerBotStandRight, 1),
            rollerBotStandLeft: new AnimationDefinition(images.rollerBotStandLeft, 1),
            rollerBotWalkRight: new AnimationDefinition(images.rollerBotWalkRight, 150),
            rollerBotWalkLeft: new AnimationDefinition(images.rollerBotWalkLeft, 150),
            rollerBotJumpRight: new AnimationDefinition(images.rollerBotJumpRight, 1),
            rollerBotJumpLeft: new AnimationDefinition(images.rollerBotJumpLeft, 1),
            rollerBotHitRight: new AnimationDefinition(images.rollerBotHitRight, 1),
            rollerBotHitLeft: new AnimationDefinition(images.rollerBotHitLeft, 1),

            fastBotStandRight: new AnimationDefinition(images.fastBotStandRight, 1),
            fastBotStandLeft: new AnimationDefinition(images.fastBotStandLeft, 1),
            fastBotWalkRight: new AnimationDefinition(images.fastBotWalkRight, 180),
            fastBotWalkLeft: new AnimationDefinition(images.fastBotWalkLeft, 180),
            fastBotJumpRight: new AnimationDefinition(images.fastBotJumpRight, 1),
            fastBotJumpLeft: new AnimationDefinition(images.fastBotJumpLeft, 1),
            fastBotHitRight: new AnimationDefinition(images.fastBotHitRight, 1),
            fastBotHitLeft: new AnimationDefinition(images.fastBotHitLeft, 1),
        };

        let fonts = {
            small: new Font(await imageLoader.load("font_small.png"), 1),
            default: new Font(await imageLoader.load("font_default.png"), 2),
            large: new Font(await imageLoader.load("font_large.png"), 3),
        };

        this._resources = new Resources(images, audio, animations, fonts);
    }

    private async loadLevelImages(name: string, imageLoader: ImageLoader): Promise<LevelImages> {
        return {
            backdrop: await imageLoader.load(`levels/${name}_background.png`),
            overlay: await imageLoader.load(`levels/${name}_overlay.png`),
            metadata: await imageLoader.load(`levels/${name}_metadata.png`),
            thumbnail: await imageLoader.load(`levels/${name}_thumbnail.png`),
        }
    }

    private requestAnimationFrame() {
        requestAnimationFrame((time) => this.update(time));
    }

    private update(time: number): void {
        let frameTime = new FrameTime(time, time - this._lastFrameTime);

        if (document.hasFocus() && !document.hidden) {
            this._screens.screenManager.update(frameTime);
        } else {
            document.title = `Paused`;
        }
        this._screens.screenManager.render();

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