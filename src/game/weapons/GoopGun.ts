import { FrameTime } from "../../utilities/FrameTime";
import { randomInt } from "../../utilities/Random";
import { Timer } from "../../utilities/Timer";
import { Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { GoopBall } from "../entities/GoopBall";
import { PlayerEntity } from "../entities/PlayerEntity";
import { Weapon } from "./Weapon";

export class GoopGunWeapon extends Weapon {
    public get name(): string { return "Goop Gun"; }
    private readonly _image: ImageBitmap;
    private _lastFireTime = -10000;
    private _fireInterval = 50;
    private _loaded = true;
    private _recoilOffset = Vector.zero;
    private _recoilTimer?: Timer;

    public constructor(player: PlayerEntity, context: IGameContext) {
        super(player, context)
        this._image = context.resources.images.goopGun;
    }

    public update(time: FrameTime): void {
        super.update(time);
        this._loaded = this.loaded(time);

        if (this._recoilTimer) {
            this._recoilTimer.update(time, () => {
                this._recoilOffset = Vector.zero;
            });
        }
    }

    public fireContinually(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void {
        if (!this._loaded)
            return

        this._lastFireTime = time.currentTime;
        this._recoilOffset = new Vector(-2, 0);
        this._recoilTimer = Timer.createOneOff(100, time);

        let fireDirection = Vector
            .fromDegreeAngle(-25 + randomInt(-5, 5))
            .mirrorX(direction.x < 0);

        let offset = new Vector(15, 4).mirrorX(direction.x < 0);
        let velocity = fireDirection.toUnit().multiplyScalar(400);
        let projectile = new GoopBall(location.add(offset), velocity, context);
        context.entityManager.add(projectile);

        context.resources.audio.goopGun.play();
    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        let offset = new Vector(-5, 2).add(this._recoilOffset);

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