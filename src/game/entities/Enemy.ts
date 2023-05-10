import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { Axis, CollisionContext, PhyicalObject } from "../Physics";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

export class EnemyEntity extends Entity {
    public physics: PhyicalObject;
    public hitpoints = 10;
    private _facing = Facing.Left;
    public speed = 200;

    public constructor(location: Vector, size: Size, gameContext: IGameContext) {
        super(location, size, gameContext);

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

    public moveLeft() {
        this.physics.velocity.x = -this.speed;
    }

    public moveRight() {
        this.physics.velocity.x = this.speed;
    }

    private turn() {
        this._facing = this._facing == Facing.Left ? Facing.Right : Facing.Left;
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "yellow";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }

    public hit(power: number) {
        this.hitpoints -= power;
        if (this.hitpoints <= 0) {
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