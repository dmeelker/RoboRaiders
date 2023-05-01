import { FrameTime } from "../../utilities/FrameTime";
import { randomInt } from "../../utilities/Random";
import { Timer } from "../../utilities/Timer";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { ProjectileEntity } from "../entities/Projectile";
import { Weapon } from "./Weapon";

export class ShotgunWeapon extends Weapon {
    private readonly _image: ImageBitmap;
    private readonly _size: Size;
    private _lastFireTime = 0;
    private _fireInterval = 1000;
    private _offset = Vector.zero;
    private _recoilTimer?: Timer;

    public constructor(context: IGameContext) {
        super();
        this._image = context.resources.images.shotgun;
        this._size = new Size(this._image.width, this._image.height);
    }

    public update(time: FrameTime): void {
        if (this._recoilTimer) {
            this._recoilTimer.update(time, () => {
                this._offset = Vector.zero;
            });
        }
    }

    public fire(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void {
        if (this.timeSinceLastFire(time) < this._fireInterval)
            return

        this._lastFireTime = time.currentTime;
        this._offset = new Vector(-4, 2);
        this._recoilTimer = Timer.createOneOff(100, time);

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
        if (direction.x > 0) {
            viewport.context.drawImage(this._image, location.x + this._offset.x, location.y + this._offset.y);
        } else {
            viewport.context.translate(location.x + (this._offset.x * -1), location.y + this._offset.y);
            viewport.context.scale(-1, 1);
            viewport.context.drawImage(this._image, 0, 0);
            viewport.context.resetTransform();
        }
    }

    private getSpreadVector(direction: Vector) {
        return Vector.fromDegreeAngle(direction.angleInDegrees + randomInt(-4, 4));
    }

    private timeSinceLastFire(time: FrameTime) { return time.currentTime - this._lastFireTime; }
}