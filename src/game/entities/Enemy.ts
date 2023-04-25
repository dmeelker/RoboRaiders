import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { PhyicalObject } from "../Physics";
import { Entity } from "./Entity";

export class EnemyEntity extends Entity {
    public physics: PhyicalObject;
    private _hitpoints = 10;

    public constructor(location: Vector) {
        super(location, new Size(20, 20));

        this.physics = new PhyicalObject(location, this.size, Vector.zero);
    }

    public update(_time: FrameTime) {
        this.physics.update(_time);

        this.location = this.physics.location;
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
}