import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { Axis, PhyicalObject } from "../Physics";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

export class EnemyEntity extends Entity {
    public physics: PhyicalObject;
    private _hitpoints = 10;
    private _facing = Facing.Left;

    public constructor(location: Vector) {
        super(location, new Size(20, 20));

        this.physics = new PhyicalObject(location, this.size, Vector.zero);
    }

    public update(_time: FrameTime) {
        if (this._facing == Facing.Left) {
            this.moveLeft();
        } else {
            this.moveRight();
        }

        this.physics.update(_time);

        if (this.physics.lastCollisions.filter(c => c.axis == Axis.X).length > 0) {
            this.turn();
        }

        this.location = this.physics.location;
    }

    public jump() {
        if (this.physics.onGround) {
            this.physics.velocity.y = -300;
        }
    }

    public moveLeft() {
        this.physics.velocity.x = -100;
    }

    public moveRight() {
        this.physics.velocity.x = 100;
    }

    private turn() {
        this._facing = this._facing == Facing.Left ? Facing.Right : Facing.Left;
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "yellow";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }

    public hit() {
        this._hitpoints--;
        if (this._hitpoints == 0) {
            this.markDisposable();
        }
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