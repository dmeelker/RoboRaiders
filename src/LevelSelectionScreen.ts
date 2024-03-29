import { IScreens, Inputs } from "./Main";
import { Resources } from "./Resources";
import { Highscores } from "./game/Highscores";
import { LevelDefinition } from "./game/LevelDefinition";
import { LevelSet } from "./game/Levels";
import { Keys } from "./input/InputProvider";
import * as Easing from "./utilities/Easing";
import { FrameTime } from "./utilities/FrameTime";
import { interpolate } from "./utilities/Math";
import { Screen } from "./utilities/ScreenManager";
import { Rectangle, Vector } from "./utilities/Trig";
import { Viewport } from "./utilities/Viewport";

export class LevelSelectionScreen extends Screen {
    private readonly _levels = new LevelSet();
    private _selectedLevelIndex = 0;
    private _renderOffset = 0;
    public highscores = new Highscores("singleplayer");
    private _transitionStart = 0;
    private _transitionEnd = 0;
    private _transitionTime = 0;
    private _mode: string = "singleplayer";

    public set mode(mode: string) {
        this._mode = mode;
        this.highscores = new Highscores(mode);
    }

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs, screens: IScreens) {
        super(viewport, resources, inputs, screens);
    }

    public activate(time: FrameTime): void {
        this.highscores.load();
        this._levels.load();
        this.transitionToLevel(this._levels.levels[0], time);
    }

    public update(time: FrameTime): void {
        if (this.inputs.player1solo.wasButtonPressedInFrame(Keys.MoveLeft)) {
            this.previousLevel(time);
        } else if (this.inputs.player1solo.wasButtonPressedInFrame(Keys.MoveRight)) {
            this.nextLevel(time);
        } else if (this.inputs.player1solo.wasButtonPressedInFrame(Keys.A) || this.inputs.player1solo.wasButtonPressedInFrame(Keys.Select)) {
            if (this.selectedLevel.locked) {
                this.resources.audio.error.play();
                this.viewport.shakeLight(time);
                return;
            }

            this.resources.audio.select.play();
            this._screens.playGame(this.selectedLevel, this._mode, time);
        } else if (this.inputs.player1solo.wasButtonPressedInFrame(Keys.Menu)) {
            this.resources.audio.select.play();
            this._screens.showMenu(time);
        }

        let timeSinceTransitionStart = time.currentTime - this._transitionTime;
        if (timeSinceTransitionStart < 300) {
            let transitionProgress = timeSinceTransitionStart / 300;
            this._renderOffset = interpolate(this._transitionStart, this._transitionEnd, Easing.easeInOutSine(transitionProgress));
        }

        this.viewport.update(time);
    }

    public render(): void {
        this.renderBackground();

        this.resources.fonts.large.renderCenteredInArea(this.viewport, "SELECT LEVEL!", 60, this.viewport.width);

        this.renderLevels();
    }

    private renderBackground() {
        this.viewport.context.drawImage(this.resources.images.background, 0, 0);
        this.viewport.context.fillStyle = "#00000088";
        this.viewport.context.fillRect(0, 0, this.viewport.width, this.viewport.height);
    }

    private renderLevels() {
        let x = this._renderOffset + (this.viewport.width / 2);
        for (let i = 0; i < this._levels.levels.length; i++) {
            if (x >= -this.viewport.width && x <= this.viewport.width) {
                this.renderLevel(this._levels.levels[i], new Vector(x, 0));
            }
            x += this.viewport.width;
        }
    }

    private renderLevel(level: LevelDefinition, centerLocation: Vector) {
        this.resources.fonts.default.renderCenteredOnPoint(this.viewport, level.name.toUpperCase(), centerLocation.addY(130));

        let highscore = this.highscores.get(level.code);
        if (highscore) {
            this.resources.fonts.small.renderCenteredOnPoint(this.viewport, `HIGHSCORE ${highscore}`, centerLocation.addY(150));
        }

        this.renderLevelThumbnail(level, centerLocation.addY(150));

        if (level.locked) {
            let levelGraphics = this.resources.images.levels[level.code]
            let thumbnailRect = new Rectangle(centerLocation.x - (levelGraphics.thumbnail.width / 2), 170, levelGraphics.thumbnail.width, levelGraphics.thumbnail.height);
            this.viewport.context.fillStyle = "#00000088";
            this.viewport.context.fillRect(thumbnailRect.x, thumbnailRect.y, thumbnailRect.width, thumbnailRect.height);

            this.resources.fonts.default.renderCenteredOnPoint(this.viewport, "LOCKED", centerLocation.addY(300));
            this.resources.fonts.small.renderCenteredOnPoint(this.viewport, "SCORE 25 POINTS TO UNLOCK", centerLocation.addY(330));
        }
    }

    private renderLevelThumbnail(level: LevelDefinition, centerLocation: Vector) {
        let levelGraphics = this.resources.images.levels[level.code];
        let thumbnailRect = new Rectangle(centerLocation.x - (levelGraphics.thumbnail.width / 2), 170, levelGraphics.thumbnail.width, levelGraphics.thumbnail.height);

        let shadowRect = thumbnailRect.translate(new Vector(3, 3));
        this.viewport.context.fillStyle = "#00000088";
        this.viewport.context.fillRect(shadowRect.x, shadowRect.y, shadowRect.width, shadowRect.height);

        this.viewport.context.drawImage(levelGraphics.thumbnail, thumbnailRect.x, thumbnailRect.y);
    }

    private previousLevel(time: FrameTime) {
        if (this._selectedLevelIndex > 0) {
            this.transitionToLevel(this._levels.levels[this._selectedLevelIndex - 1], time);
        } else {
            this.transitionToLevel(this._levels.levels[this._levels.levels.length - 1], time);
        }

        this.resources.audio.select.play();
    }

    private nextLevel(time: FrameTime) {
        if (this._selectedLevelIndex < this._levels.levels.length - 1) {
            this.transitionToLevel(this._levels.levels[this._selectedLevelIndex + 1], time);
        } else {
            this.transitionToLevel(this._levels.levels[0], time);
        }

        this.resources.audio.select.play();
    }

    public transitionToLevel(level: LevelDefinition, time: FrameTime) {
        this._transitionTime = time.currentTime;
        this._transitionStart = this.levelOffset(this._selectedLevelIndex);
        this._selectedLevelIndex = this._levels.levels.indexOf(level);
        this._transitionEnd = this.levelOffset(this._selectedLevelIndex);
    }

    public selectLevel(level: LevelDefinition) {
        this._transitionTime = -10000;
        this._selectedLevelIndex = this._levels.levels.indexOf(level);
    }

    private get selectedLevel() {
        return this._levels.levels[this._selectedLevelIndex];
    }

    private levelOffset(index: number) {
        return -(index * this.viewport.width);
    }
}