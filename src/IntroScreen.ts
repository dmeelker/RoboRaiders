import { IScreens, Inputs } from "./Main";
import { Resources } from "./Resources";
import { FrameTime } from "./utilities/FrameTime";
import { Screen } from "./utilities/ScreenManager";
import { Vector } from "./utilities/Trig";
import { Viewport } from "./utilities/Viewport";

export class IntroScreen extends Screen {
    private _startTime = 0;
    private _showKeyLabel = true;

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs, screens: IScreens) {
        super(viewport, resources, inputs, screens);
    }

    public update(time: FrameTime): void {
        if (this.inputs.player1.anyButtonPressedInFrame()) {
            this.resources.audio.select.play();
            this._screens.showLevelSelect(time);
        }

        this._showKeyLabel = ((time.currentTime - this._startTime) % 1000) > 500;
    }

    public render(): void {
        this.viewport.context.drawImage(this.resources.images.background, 0, 0);

        this.resources.fonts.small.renderCenteredInArea(this.viewport, "WELCOME TO", 60, this.viewport.width);

        this.resources.fonts.large.renderCenteredInArea(this.viewport, "ROBO RAIDERS", 100, this.viewport.width);

        if (this._showKeyLabel) {
            this.resources.fonts.default.renderCenteredInArea(this.viewport, "PRESS ANY KEY TO START", 200, this.viewport.width);
        }

        this.resources.fonts.small.render(this.viewport, "A DENSPEL GAME", new Vector(465, 475));
    }
}