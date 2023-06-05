import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

export class BatSwingEntity extends Entity {
    private readonly _lifetime = 30;
    private readonly _swingDirection: Vector;
    private readonly _image: ImageBitmap;

    public constructor(centerLocation: Vector, time: FrameTime, swingDirection: Vector, context: IGameContext) {
        super(centerLocation, new Size(30, 20), context);

        this._image = context.resources.images.batSwing;

        if (swingDirection.x < 0) {
            this._swingDirection = new Vector(-1, -1);
        } else {
            this._swingDirection = new Vector(1, -1);
        }

        this.centerOn(centerLocation);
    }

    public update(_time: FrameTime) {
        let age = this.age;

        if (age > this._lifetime) {
            this.markDisposable();
            return;
        }

        this.causeDamage();
    }

    private causeDamage() {
        let enemies = this.context.entityManager.getOfType(EnemyEntity);
        for (let enemy of enemies) {
            if (enemy.bounds.overlaps(this.bounds) && !enemy.stunned) {
                enemy.hit(5);
                enemy.push(this._swingDirection.toUnit().multiplyScalar(500));
                enemy.stun();
            }
        }
    }

    public render(viewport: Viewport) {
        viewport.context.translate(Math.floor(this.location.x), Math.floor(this.location.y));

        if (this.facing == Facing.Left) {
            viewport.context.scale(-1, 1);
            viewport.context.translate(-this.size.width, 0);
        }

        viewport.context.drawImage(this._image, 0, 0);
        viewport.context.resetTransform();

    }

    private get facing() { return this._swingDirection.x > 0 ? Facing.Right : Facing.Left; }
}