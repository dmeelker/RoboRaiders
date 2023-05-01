import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { Axis, CollisionContext, PhyicalObject } from "../Physics";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

export class EnemyEntity extends Entity {
    public physics: PhyicalObject;
    private _hitpoints = 10;
    private _facing = Facing.Left;

    public constructor(location: Vector, gameContext: IGameContext) {
        super(location, new Size(32, 32), gameContext);

        this.physics = new PhyicalObject(
            this, Vector.zero,
            new CollisionContext(this.context.level, this.context.entityManager));
    }

    public update(time: FrameTime) {
        if (this._facing == Facing.Left) {
            this.moveLeft();
        } else {
            this.moveRight();
        }

        this.physics.update(time);

        if (this.physics.lastCollisions.filter(c => c.axis == Axis.X && !c.passable).length > 0) {
            this.turn();
        }
    }

    public jump() {
        if (this.physics.onGround) {
            this.physics.velocity.y = -300;
        }
    }

    public moveLeft() {
        this.physics.velocity.x = -200;
    }

    public moveRight() {
        this.physics.velocity.x = 200;
    }

    private turn() {
        this._facing = this._facing == Facing.Left ? Facing.Right : Facing.Left;
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "yellow";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }

    public hit(power: number) {
        this._hitpoints -= power;
        if (this._hitpoints <= 0) {
            this.markDisposable();
        }
    }

    public get facing() { return this._facing; }
    public set facing(facing: Facing) {
        this._facing = facing;
    }

    public get lookVector() {
        switch (this._facing) {
            case Facing.Left:
                return Vector.left;
            case Facing.Right:
                return Vector.right;
        }
    }
}