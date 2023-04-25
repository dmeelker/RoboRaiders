import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { PhyicalObject } from "../Physics";
import { Entity } from "./Entity";

export class ProjectileEntity extends Entity {
    public physics: PhyicalObject;

    public constructor(location: Vector, velocity: Vector) {
        super(location, new Size(3, 3));

        this.physics = new PhyicalObject(location, this.size, velocity);
        this.physics.gravity = false;
    }

    public update(_time: FrameTime) {
        this.physics.update(_time);

        this.location = this.physics.location;

        if (this.physics.lastCollisions.length > 0) {

        }
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "red";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }
}