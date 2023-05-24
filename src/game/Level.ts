import { Rectangle, Size, Vector } from "../utilities/Trig";
import { Viewport } from "../utilities/Viewport";

export class Level {
    private _blocks = new Array<Rectangle>();
    private readonly _size: Size;
    private readonly _bounds: Rectangle;
    private readonly _itemSpawnAreas: Array<Rectangle>;
    private readonly _playerSpawnLocations: Array<Vector>;

    public constructor(size: Size, blocks: Array<Rectangle>, playerSpawnLocations: Array<Vector>) {
        this._size = size;
        this._bounds = new Rectangle(0, 0, size.width, size.height);
        this._playerSpawnLocations = playerSpawnLocations;

        this._blocks = [...blocks];
        this._itemSpawnAreas = this.determineItemSpawnAreas();
        this.createLevelBoundaries();
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
    public get playerSpawnLocations() { return this._playerSpawnLocations; }
}

