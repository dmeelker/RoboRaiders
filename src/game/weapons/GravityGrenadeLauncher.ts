import { FrameTime } from "../../utilities/FrameTime";
import { Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { GravityGrenadeEntity } from "../entities/GravityGrenade";
import { PlayerEntity } from "../entities/PlayerEntity";
import { Weapon } from "./Weapon";

export class GravityGrenadeWeapon extends Weapon {
    public get name(): string { return "Singularity grenades" }
    private readonly _image: ImageBitmap;
    private _lastFireTime = -10000;
    private _fireInterval = 1500;
    private _loaded = true;

    public constructor(player: PlayerEntity, context: IGameContext) {
        super(player, context)
        this._image = context.resources.images.gravityGrenadeUnarmed;
    }

    public update(time: FrameTime): void {
        super.update(time);

        this._loaded = this.loaded(time);
    }

    public fireSingleShot(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void {
        if (!this._loaded)
            return

        this._lastFireTime = time.currentTime;

        let throwDirection = new Vector(1, -1);
        if (direction.x < 0)
            throwDirection = throwDirection.mirrorX();

        let velocity = throwDirection.toUnit().multiplyScalar(400);
        let projectile = new GravityGrenadeEntity(location, velocity, time, context);
        context.entityManager.add(projectile);
    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        if (!this._loaded) {
            return;
        }

        let offset = new Vector(-14, 0);

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