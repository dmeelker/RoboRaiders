import { IScreens, Inputs, Resources } from "./Main";
import { levels } from "./game/Levels";
import { Keys } from "./input/InputProvider";
import { FrameTime } from "./utilities/FrameTime";
import { Screen } from "./utilities/ScreenManager";
import { Viewport } from "./utilities/Viewport";
import * as Align from "./utilities/Align";
import { Size } from "./utilities/Trig";

export class LevelSelectionScreen extends Screen {
    private readonly _levels = levels;
    private _selectedLevelIndex = 0;

    private _nameLabel = document.createElement("div");

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs, screens: IScreens) {
        super(viewport, resources, inputs, screens);
        this._nameLabel.className = "ui-label";
    }

    public activate(time: FrameTime): void {
        this.viewport.uiElement.appendChild(this._nameLabel);
        this.selectLevel(0);
    }

    public deactivate(time: FrameTime): void {
        this.viewport.uiElement.removeChild(this._nameLabel);
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
        this.viewport.clearCanvas();

        let levelGraphics = this.resources.images.levels[this.selectedLevel.code];


        this.viewport.context.drawImage(levelGraphics.thumbnail, Align.center(this.viewport.width, levelGraphics.thumbnail.width), 100);
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
    }

    private get selectedLevel() {
        return this._levels[this._selectedLevelIndex];
    }
}