import { IScreens, Inputs, Resources } from "./Main";
import { levels } from "./game/Levels";
import { Keys } from "./input/InputProvider";
import { FrameTime } from "./utilities/FrameTime";
import { Screen } from "./utilities/ScreenManager";
import { Viewport } from "./utilities/Viewport";
import * as Align from "./utilities/Align";
import { Point, Rectangle, Size } from "./utilities/Trig";
import { Highscores } from "./game/Highscores";

export class LevelSelectionScreen extends Screen {
    private readonly _levels = levels;
    private _selectedLevelIndex = 0;
    private _highscores = new Highscores();

    private _nameLabel = document.createElement("div");
    private _highscoreLabel = document.createElement("div");

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs, screens: IScreens) {
        super(viewport, resources, inputs, screens);

        this._nameLabel.className = "ui-label text-l";
        this._nameLabel.style.textAlign = "center";

        this._highscoreLabel.className = "ui-label text-s";
        this._highscoreLabel.style.textAlign = "center";
    }

    public activate(time: FrameTime): void {
        this.viewport.uiElement.appendChild(this._nameLabel);
        this.viewport.uiElement.appendChild(this._highscoreLabel);
        this.selectLevel(0);
    }

    public deactivate(time: FrameTime): void {
        this.viewport.uiElement.removeChild(this._nameLabel);
        this.viewport.uiElement.removeChild(this._highscoreLabel);
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
        //this.viewport.clearCanvas("goldenrod");
        this.viewport.context.drawImage(this.resources.images.background, 0, 0);

        let levelGraphics = this.resources.images.levels[this.selectedLevel.code];
        let thumbnailRect = new Rectangle(Align.center(this.viewport.width, levelGraphics.thumbnail.width), 100, levelGraphics.thumbnail.width, levelGraphics.thumbnail.height);

        let outlineRect = thumbnailRect.addBorder(10);
        this.viewport.context.fillStyle = "black";
        this.viewport.context.fillRect(outlineRect.x, outlineRect.y, outlineRect.width, outlineRect.height)

        this.viewport.context.drawImage(levelGraphics.thumbnail, thumbnailRect.x, thumbnailRect.y);
    }

    private previousLevel() {
        if (this._selectedLevelIndex > 0) {
            this.selectLevel(this._selectedLevelIndex - 1);
        }
    }

    private nextLevel() {
        if (this._selectedLevelIndex < this._levels.length - 1) {
            this.selectLevel(this._selectedLevelIndex + 1);
        }
    }

    private selectLevel(index: number) {
        this._selectedLevelIndex = index;
        this._nameLabel.innerText = this.selectedLevel.name;

        let highscore = this._highscores.get(this.selectedLevel.code);
        if (highscore) {
            this._highscoreLabel.innerText = `Highscore: ${highscore}`;
        } else {
            this._highscoreLabel.innerText = "";
        }
    }

    private get selectedLevel() {
        return this._levels[this._selectedLevelIndex];
    }
}