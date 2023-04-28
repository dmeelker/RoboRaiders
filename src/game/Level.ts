import { Rectangle } from "../utilities/Trig";
import { Viewport } from "../utilities/Viewport";

export class Level {
    private _blocks = new Array<Rectangle>();

    public constructor() {
        this._blocks.push(new Rectangle(0, 0, 400, 100));
        this._blocks.push(new Rectangle(0, 300, 400, 100));
        this._blocks.push(new Rectangle(0, 0, 100, 400));
        this._blocks.push(new Rectangle(300, 0, 100, 400));
        this._blocks.push(new Rectangle(150, 200, 100, 10));
        this._blocks.push(new Rectangle(100, 250, 50, 10));
        this._blocks.push(new Rectangle(250, 250, 50, 10));
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "gray";

        for (let block of this._blocks) {
            viewport.context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    public get blocks() { return this._blocks; }
}