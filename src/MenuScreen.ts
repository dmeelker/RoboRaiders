import { IScreens, Inputs } from "./Main";
import { Resources } from "./Resources";
import { Keys } from "./input/InputProvider";
import { FrameTime } from "./utilities/FrameTime";
import { Screen } from "./utilities/ScreenManager";
import { Vector } from "./utilities/Trig";
import { Viewport } from "./utilities/Viewport";

class MenuItem {
    public text: string;
    public constructor(text: string) {
        this.text = text;
    }
}

export class MenuScreen extends Screen {
    private readonly _singlePlayerItem = new MenuItem("Single Player".toUpperCase());
    private readonly _coopItem = new MenuItem("2 player coop".toUpperCase());
    private _selectedItem = this._singlePlayerItem;
    private readonly _allItems = [this._singlePlayerItem, this._coopItem];

    public constructor(viewport: Viewport, resources: Resources, inputs: Inputs, screens: IScreens) {
        super(viewport, resources, inputs, screens);
    }

    public activate(time: FrameTime): void {
        this._resources.audio.music.play();
    }

    public update(time: FrameTime): void {
        if (this.inputs.player1.wasButtonPressedInFrame(Keys.MoveDown)) {
            this.next();
        } else if (this.inputs.player1.wasButtonPressedInFrame(Keys.MoveUp)) {
            this.previous();
        } if (this.inputs.player1.wasButtonPressedInFrame(Keys.A) || this.inputs.player1.wasButtonPressedInFrame(Keys.Select)) {
            this.select(time);
        }

        if (this.inputs.player1.wasButtonPressedInFrame(Keys.Menu)) {
            this.resources.audio.select.play();
            this._screens.showIntro(time);
        }

        this.viewport.update(time);
    }

    public render(): void {
        this.renderBackground();
        this.renderHeader();
        this.renderMenuItems();
    }

    private renderMenuItems() {
        let y = 200;

        for (let menuItem of this._allItems) {
            let menuFont = this._selectedItem == menuItem ? this.resources.fonts.redDefault : this.resources.fonts.default;
            menuFont.renderCenteredInArea(this.viewport, menuItem.text, y, this.viewport.width);
            y += 45;
        }
    }

    private renderHeader() {
        this.resources.fonts.small.renderCenteredInArea(this.viewport, "WELCOME TO", 60, this.viewport.width);
        this.resources.fonts.large.renderCenteredInArea(this.viewport, "ROBO RAIDERS", 100, this.viewport.width);

        this.resources.fonts.small.render(this.viewport, "A DENSPEL GAME", new Vector(465, 475));
    }

    private renderBackground() {
        this.viewport.context.drawImage(this.resources.images.background, 0, 0);
        this.viewport.context.fillStyle = "#00000088";
        this.viewport.context.fillRect(0, 0, this.viewport.width, this.viewport.height);
    }

    private next() {
        this._resources.audio.select.play();
        let index = this._allItems.indexOf(this._selectedItem);

        if (index < this._allItems.length - 1) {
            this._selectedItem = this._allItems[index + 1];
        }
    }

    private previous() {
        this._resources.audio.select.play();
        let index = this._allItems.indexOf(this._selectedItem);

        if (index > 0) {
            this._selectedItem = this._allItems[index - 1];
        }
    }

    private select(time: FrameTime) {
        this._resources.audio.select.play();
        if (this._selectedItem == this._singlePlayerItem) {
            this._screens.showLevelSelect(time, "singleplayer");
        } else if (this._selectedItem == this._coopItem) {
            this._screens.showLevelSelect(time, "coop");
        }
    }
}