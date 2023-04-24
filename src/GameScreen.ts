import { Keys } from "./input/InputProvider";
import { FrameTime } from "./utilities/FrameTime";
import { Screen } from "./utilities/ScreenManager";
import { Timer } from "./utilities/TImer";

export class GameScreen extends Screen {
    private _x = 0;
    private _y = 0;
    private _timer: Timer = null!;

    public activate(time: FrameTime): void {
        this._timer = Timer.createRepeating(1000, time);
    }

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

        if (this.input.wasButtonPressedInFrame(Keys.A)) {
            this.audio.fire.play();
        }

        this._timer.update(time, () => {
            console.log("REPEAT");
        });
    }

    public render(): void {
        this.viewport.clearCanvas();

        this.viewport.context.drawImage(this.images.apple, this._x, this._y);
    }
}
