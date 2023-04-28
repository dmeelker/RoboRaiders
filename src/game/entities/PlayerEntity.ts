import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { Player } from "../Player";
import { Entity } from "./Entity";
import { PriceEntity } from "./PrizeEntity";

export enum Facing {
    Left,
    Right,
}

export class PlayerEntity extends Entity {
    private readonly _player: Player;
    public physics: PhyicalObject;
    private _facing = Facing.Left;

    public constructor(location: Vector, player: Player, gameContext: IGameContext) {
        super(location, new Size(20, 20), gameContext);
        this._player = player;

        this.physics = new PhyicalObject(this, Vector.zero, new CollisionContext(this.context.level, this.context.entityManager));
    }

    public update(time: FrameTime) {
        this.physics.update(time);

        let prizes = this.context.entityManager.getOfType(PriceEntity);
        for (let prize of prizes) {
            if (prize.bounds.overlaps(this.bounds)) {
                prize.markDisposable();
                this._player.addPoint();
            }
        }
    }

    public jump() {
        if (this.physics.onGround) {
            this.physics.velocity.y = -300;
        }
    }

    public moveLeft() {
        this.physics.velocity.x = -200;
        this._facing = Facing.Left;
    }

    public moveRight() {
        this.physics.velocity.x = 200;
        this._facing = Facing.Right;
    }

    public render(viewport: Viewport) {
        // viewport.context.fillStyle = "gray";
        // viewport.context.fillRect(150, 200, 100, 10);
        // viewport.context.fillRect(100, 250, 50, 10);
        // viewport.context.fillRect(250, 250, 50, 10);

        // viewport.context.fillRect(0, 0, 400, 100);
        // viewport.context.fillRect(0, 300, 400, 100);
        // viewport.context.fillRect(0, 0, 100, 400);
        // viewport.context.fillRect(300, 0, 100, 400);

        viewport.context.fillStyle = "green";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }

    public get facing() { return this._facing; }

    public get lookVector() {
        switch (this._facing) {
            case Facing.Left:
                return Vector.left;
            case Facing.Right:
                return Vector.right;
        }
    }
}