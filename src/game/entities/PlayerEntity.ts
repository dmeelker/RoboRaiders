import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { PhyicalObject } from "../Physics";
import { Entity } from "./Entity";

export class PlayerEntity extends Entity {
    public physics: PhyicalObject;
    public constructor(location: Vector) {
        super(location, new Size(20, 20));

        this.physics = new PhyicalObject(location, this.size, Vector.zero);
    }

    public update(_time: FrameTime) {
        this.physics.update(_time);

        this.location = this.physics.location;
    }

    public jump() {
        this.physics.velocity.y = -300;
    }

    public moveLeft() {
        this.physics.velocity.x = -200;
    }

    public moveRight() {
        this.physics.velocity.x = 200;
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "gray";
        viewport.context.fillRect(150, 200, 100, 10);
        viewport.context.fillRect(100, 250, 50, 10);
        viewport.context.fillRect(250, 250, 50, 10);

        viewport.context.fillRect(0, 0, 400, 100);
        viewport.context.fillRect(0, 300, 400, 100);
        viewport.context.fillRect(0, 0, 100, 400);
        viewport.context.fillRect(300, 0, 100, 400);

        viewport.context.fillStyle = "green";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }
}