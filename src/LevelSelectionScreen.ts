import { IScreens, Inputs, Resources } from "./Main";
import { LevelDefinition, levels } from "./game/Levels";
import { Keys } from "./input/InputProvider";
import { FrameTime } from "./utilities/FrameTime";
import { Screen } from "./utilities/ScreenManager";
import { Viewport } from "./utilities/Viewport";
import * as Align from "./utilities/Align";
import { Point, Rectangle, Size, Vector } from "./utilities/Trig";
import { Highscores } from "./game/Highscores";

export class LevelSelectionScreen extends Screen {
    private readonly _levels = levels;
    private _selectedLevelIndex = 0;
    private _highscores = new Highscores();


    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs, screens: IScreens) {
        super(viewport, resources, inputs, screens);
    }

    public activate(time: FrameTime): void {
        this._highscores.load();
        this.selectLevel(this._levels[0]);
    }

    public update(time: FrameTime): void {
        if (this.inputs.player1.wasButtonPressedInFrame(Keys.MoveLeft)) {
            this.previousLevel();
        } else if (this.inputs.player1.wasButtonPressedInFrame(Keys.MoveRight)) {
            this.nextLevel();
        } else if (this.inputs.player1.wasButtonPressedInFrame(Keys.A)) {
            this._screens.playGame(this.selectedLevel, time);
        }

        this.viewport.update(time);
    }

    public render(): void {
        this.viewport.context.drawImage(this.resources.images.background, 0, 0);

        this.resources.fonts.large.renderHCentered(this.viewport, "SELECT LEVEL!", 60, this.viewport.width);
        this.resources.fonts.default.renderHCentered(this.viewport, this.selectedLevel.name.toUpperCase(), 110, this.viewport.width);


        let highscore = this._highscores.get(this.selectedLevel.code);
        if (highscore) {
            this.resources.fonts.small.renderHCentered(this.viewport, `HIGHSCORE ${highscore}`, 130, this.viewport.width);
        }

        this.renderThumbnail();
    }

    private renderThumbnail() {
        let levelGraphics = this.resources.images.levels[this.selectedLevel.code];
        let thumbnailRect = new Rectangle(Align.center(this.viewport.width, levelGraphics.thumbnail.width), 150, levelGraphics.thumbnail.width, levelGraphics.thumbnail.height);

        let shadowRect = thumbnailRect.translate(new Vector(2, 2));
        this.viewport.context.fillStyle = "#00000088";
        this.viewport.context.fillRect(shadowRect.x, shadowRect.y, shadowRect.width, shadowRect.height);

        this.viewport.context.drawImage(levelGraphics.thumbnail, thumbnailRect.x, thumbnailRect.y);
    }

    private previousLevel() {
        if (this._selectedLevelIndex > 0) {
            this.selectLevel(this._levels[this._selectedLevelIndex - 1]);
        } else {
            this.selectLevel(this._levels[this._levels.length - 1]);
        }
    }

    private nextLevel() {
        if (this._selectedLevelIndex < this._levels.length - 1) {
            this.selectLevel(this._levels[this._selectedLevelIndex + 1]);
        } else {
            this.selectLevel(this._levels[0]);
        }
    }

    public selectLevel(level: LevelDefinition) {
        this._selectedLevelIndex = this._levels.indexOf(level);
    }

    private get selectedLevel() {
        return this._levels[this._selectedLevelIndex];
    }
}