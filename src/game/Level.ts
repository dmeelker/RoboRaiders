import { Rectangle, Size } from "../utilities/Trig";
import { Viewport } from "../utilities/Viewport";

export class Level {
    private _blocks = new Array<Rectangle>();
    private readonly _size: Size;
    private readonly _bounds: Rectangle;
    private readonly _itemSpawnAreas: Array<Rectangle>;

    public constructor(size: Size) {
        this._size = size;
        this._bounds = new Rectangle(0, 0, size.width, size.height);

        this.createLevelBoundaries();

        this._blocks.push(new Rectangle(0, 40, 22, 10));
        this._blocks.push(new Rectangle(200 - 22, 40, 22, 10));

        this._blocks.push(new Rectangle(50, 100, 100, 10));
        this._blocks.push(new Rectangle(0, 150, 50, 10));
        this._blocks.push(new Rectangle(150, 150, 50, 10));

        this._itemSpawnAreas = this.determineItemSpawnAreas();
    }

    private createLevelBoundaries() {
        const depth = 100;
        this._blocks.push(new Rectangle(-depth, -depth, this._size.width + (depth * 2), depth));
        this._blocks.push(new Rectangle(-depth, this._size.height, this._size.width + (depth * 2), depth));
        this._blocks.push(new Rectangle(-depth, -depth, depth, this._size.height + (depth * 2)));
        this._blocks.push(new Rectangle(this._size.width, -depth, depth, this._size.height + (depth * 2)));
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "gray";

        for (let block of this._blocks) {
            viewport.context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    private determineItemSpawnAreas(): Rectangle[] {
        let areas = new Array<Rectangle>;

        for (let block of this._blocks) {
            if (!this._bounds.containsRect(block))
                continue;

            areas.push(new Rectangle(block.x, block.y - 20, block.width, 20));
        }

        return areas;
    }

    public get blocks() { return this._blocks; }
    public get bounds() { return this._bounds; }
    public get itemSpawnAreas() { return this._itemSpawnAreas; }
}
