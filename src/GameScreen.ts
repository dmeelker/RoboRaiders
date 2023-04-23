import { Keys } from "./input/InputProvider";
import { FrameTime } from "./utilities/FrameTime";
import { Screen } from "./utilities/ScreenManager";

export class GameScreen extends Screen {
    private _x = 0;
    private _y = 0;

    public update(time: FrameTime): void {
        let speed = time.calculateMovement(300);

        if (this.input.isButtonDown(Keys.MoveLeft)) {
            this._x -= speed;
        } else if (this.input.isButtonDown(Keys.MoveRight)) {
            this._x += speed;
        }

        if (this.input.isButtonDown(Keys.MoveUp)) {
            this._y -= speed;
        } else if (this.input.isButtonDown(Keys.MoveDown)) {
            this._y += speed;
        }
    }

    public render(): void {
        this.viewport.clearCanvas();

        this.viewport.context.drawImage(this.images.apple, this._x, this._y);
        // this.viewport.context.beginPath();
        // this.viewport.context.fillStyle = "green";
        // this.viewport.context.fillRect(this._x, this._y, 20, 20);
    }
}
