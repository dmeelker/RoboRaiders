import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { GoopPuddle } from "./GoopPuddle";

export class GoopBall extends Entity {
    private readonly _image: ImageBitmap;
    public physics: PhyicalObject;

    public constructor(location: Vector, velocity: Vector, context: IGameContext) {
        super(location, new Size(0, 0), context);
        this._image = context.resources.images.goopBall;
        this.size = new Size(this._image.width, this._image.height);

        this.physics = new PhyicalObject(
            this,
            velocity,
            new CollisionContext(this.context.level, this.context.entityManager),
            e => e instanceof EnemyEntity);
        this.physics.gravity = true;
        this.physics.gravityVector = new Vector(0, 1000);
    }

    public update(time: FrameTime) {
        this.physics.update(time);

        if (this.physics.lastCollisions.length > 0) {
            this.stick();
        }
    }

    private stick() {
        let goop = new GoopPuddle(this.centerLocation, this.context);
        this.context.entityManager.add(goop);
        this.markDisposable();
    }

    public render(viewport: Viewport) {
        this.drawCenteredImage(this._image, viewport);
    }
}