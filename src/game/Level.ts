import { Rectangle, Size, Vector } from "../utilities/Trig";
import { Viewport } from "../utilities/Viewport";
import { GateDirection } from "./entities/Gate";

export class LevelDefinition {
    public backdropImage = "";
    public blocks = new Array<Rectangle>();
    public gates = new Array<GateDefinition>();
    public spawns = new Array<EnemySpawnDefinition>();
    public player1Location = new Vector(0, 0);
    public player2Location = new Vector(0, 0);
}

export class GateDefinition {
    public id = "";
    public location = Vector.zero;
    public direction = GateDirection.Left;
    public matchingGateId = "";
}

export class EnemySpawnDefinition {
    public location = Vector.zero;
    public size = new Size(10, 10);
}

export class Level {
    private _blocks = new Array<Rectangle>();
    private readonly _size: Size;
    private readonly _bounds: Rectangle;
    private readonly _itemSpawnAreas: Array<Rectangle>;

    public constructor(size: Size, blocks: Array<Rectangle>) {
        this._size = size;
        this._bounds = new Rectangle(0, 0, size.width, size.height);

        this.createLevelBoundaries();

        for (let block of blocks) {
            this._blocks.push(block);
        }
        // this._blocks.push(new Rectangle(0, 40, 22, 10));
        // this._blocks.push(new Rectangle(200 - 22, 40, 22, 10));

        // this._blocks.push(new Rectangle(50, 100, 100, 10));
        // this._blocks.push(new Rectangle(0, 150, 50, 10));
        // this._blocks.push(new Rectangle(150, 150, 50, 10));

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
