import { FrameTime } from "../../utilities/FrameTime";
import { randomInt } from "../../utilities/Random";
import { Timer } from "../../utilities/Timer";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { PlayerEntity } from "../entities/PlayerEntity";
import { ProjectileEntity } from "../entities/Projectile";
import { Weapon } from "./Weapon";

export class MachineGunWeapon extends Weapon {
    public get name(): string { return "Machine gun" }
    private readonly _image: ImageBitmap;
    private readonly _size = new Size(18, 5);
    private _offset = Vector.zero;
    private _lastFireTime = 0;
    private _fireInterval = 100;
    private _recoilTimer?: Timer;

    public constructor(player: PlayerEntity, context: IGameContext) {
        super(player, context)
        this._image = context.resources.images.machinegun;
        this._size = new Size(this._image.width, this._image.height);
    }

    public update(time: FrameTime): void {
        super.update(time);

        if (this._recoilTimer) {
            this._recoilTimer.update(time, () => {
                this._offset = Vector.zero;
            });
        }
    }

    public fireContinually(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void {
        if (this.timeSinceLastFire(time) < this._fireInterval)
            return;

        this._lastFireTime = time.currentTime;
        this._offset = new Vector(randomInt(1, 3), randomInt(-1, 1));
        this._recoilTimer = Timer.createOneOff(50, time);

        let offset = direction.x > 0 ? new Vector(this._size.width, 0) : new Vector(this._size.width * -1, 0);
        let velocity = this.getSpreadVector(direction).toUnit().multiplyScalar(600);
        let projectile = new ProjectileEntity(location.add(offset), velocity, time, context);
        projectile.power = 1;
        context.entityManager.add(projectile);

        context.resources.audio.machinegun.play();
    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        let offset = new Vector(-2, 0);
        offset = offset.add(this._offset);

        if (direction.x > 0) {
            viewport.context.drawImage(this._image, location.x + offset.x, location.y + offset.y);
        } else {
            viewport.context.translate(location.x + (offset.x * -1), location.y + offset.y);
            viewport.context.scale(-1, 1);
            viewport.context.drawImage(this._image, 0, 0);
            viewport.context.resetTransform();
        }
    }

    private getSpreadVector(direction: Vector) {
        return Vector.fromDegreeAngle(direction.angleInDegrees + randomInt(-2, 2));
    }

    private timeSinceLastFire(time: FrameTime) { return time.currentTime - this._lastFireTime; }
}