import { FrameTime } from "../../utilities/FrameTime";
import { randomInt } from "../../utilities/Random";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { ProjectileEntity } from "../entities/Projectile";
import { Weapon } from "./Weapon";

export class ShotgunWeapon extends Weapon {
    private readonly _context: IGameContext;
    private readonly _image: ImageBitmap;
    private readonly _size: Size;
    private _lastFireTime = 0;
    private _fireInterval = 1000;

    public constructor(context: IGameContext) {
        super();
        this._context = context;
        this._image = context.resources.images.shotgun;
        this._size = new Size(this._image.width, this._image.height);
    }

    public fire(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void {
        if (time.currentTime - this._lastFireTime >= this._fireInterval) {
            this._lastFireTime = time.currentTime;
        } else {
            return;
        }

        for (let i = 0; i < 8; i++) {
            let speed = randomInt(600, 800);
            let offset = direction.x > 0 ? new Vector(this._size.width, 0) : new Vector(this._size.width * -1, 0);
            let velocity = this.getSpreadVector(direction).toUnit().multiplyScalar(speed);
            let projectile = new ProjectileEntity(location.add(offset), velocity, time, context);
            projectile.maxAge = randomInt(250, 350);
            context.entityManager.add(projectile);
        }

    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        viewport.context.fillStyle = "gray";

        if (direction.x > 0) {
            viewport.context.drawImage(this._image, location.x, location.y);
        } else {
            viewport.context.translate(location.x, location.y);
            viewport.context.scale(-1, 1);
            viewport.context.drawImage(this._image, 0, 0);
            viewport.context.resetTransform();
        }
    }

    private getSpreadVector(direction: Vector) {
        return Vector.fromDegreeAngle(direction.angleInDegrees + randomInt(-4, 4));
    }
}