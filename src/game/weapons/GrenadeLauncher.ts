import { FrameTime } from "../../utilities/FrameTime";
import { Timer } from "../../utilities/Timer";
import { Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { GrenadeLauncherGrenadeEntity } from "../entities/GrenadeLauncherGrenade";
import { Weapon } from "./Weapon";

export class GrenadeLauncherWeapon extends Weapon {
    public get name(): string { return "Grenade Launcher"; }
    private readonly _image: ImageBitmap;
    private _lastFireTime = -10000;
    private _fireInterval = 500;
    private _loaded = true;
    private _recoilOffset = Vector.zero;
    private _recoilTimer?: Timer;

    public constructor(context: IGameContext) {
        super();
        this._image = context.resources.images.grenadeLauncher;
    }

    public update(time: FrameTime): void {
        this._loaded = this.loaded(time);

        if (this._recoilTimer) {
            this._recoilTimer.update(time, () => {
                this._recoilOffset = Vector.zero;
            });
        }
    }

    public fireSingleShot(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void {
        if (!this._loaded)
            return

        this._lastFireTime = time.currentTime;
        this._recoilOffset = new Vector(-4, 2);
        this._recoilTimer = Timer.createOneOff(100, time);

        let throwDirection = Vector.fromDegreeAngle(-25);
        if (direction.x < 0)
            throwDirection = throwDirection.mirrorX();

        let offset = new Vector(10, 4).mirrorX(direction.x < 0);
        let velocity = throwDirection.toUnit().multiplyScalar(600);
        let projectile = new GrenadeLauncherGrenadeEntity(location.add(offset), velocity, context);
        context.entityManager.add(projectile);

        context.resources.audio.grenadeLauncher.play();
    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        let offset = new Vector(-10, 2).add(this._recoilOffset);

        if (direction.x > 0) {
            viewport.context.translate(location.x + offset.x, location.y + offset.y);
        } else {
            viewport.context.translate(location.x + (offset.x * -1), location.y + offset.y);
            viewport.context.scale(-1, 1);
        }

        viewport.context.drawImage(this._image, 0, 0);
        viewport.context.resetTransform();
    }

    private timeSinceLastFire(time: FrameTime) { return time.currentTime - this._lastFireTime; }
    private loaded(time: FrameTime) { return this.timeSinceLastFire(time) > this._fireInterval; }
}