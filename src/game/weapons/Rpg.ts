import { FrameTime } from "../../utilities/FrameTime";
import { Timer } from "../../utilities/Timer";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { MissileEntity } from "../entities/Missile";
import { PlayerEntity } from "../entities/PlayerEntity";
import { Weapon } from "./Weapon";

export class RpgWeapon extends Weapon {
    public get name(): string { return "RPG" }
    private readonly _image: ImageBitmap;
    private readonly _grenadeImage: ImageBitmap;
    private readonly _size: Size;
    private _lastFireTime = -10000;
    private _fireInterval = 1500;
    private _offset = Vector.zero;
    private _recoilTimer?: Timer;
    private _loaded = true;

    public constructor(player: PlayerEntity, context: IGameContext) {
        super(player, context)
        this._image = context.resources.images.rpg;
        this._grenadeImage = context.resources.images.rpgGrenade;
        this._size = new Size(this._image.width, this._image.height);
    }

    public update(time: FrameTime): void {
        super.update(time);

        if (this._recoilTimer) {
            this._recoilTimer.update(time, () => {
                this._offset = Vector.zero;
            });
        }

        this._loaded = this.loaded(time);
    }

    public fireSingleShot(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void {
        if (!this._loaded)
            return

        this._lastFireTime = time.currentTime;
        this._offset = new Vector(-4, 2);
        this._recoilTimer = Timer.createOneOff(100, time);

        let offset = direction.x > 0 ? new Vector(this._size.width, -2) : new Vector(this._size.width * -1, 0);
        let projectile = new MissileEntity(location.add(offset), direction.toUnit(), time, context);
        context.entityManager.add(projectile);
    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        let offset = new Vector(-14, 0).add(this._offset);

        if (direction.x > 0) {
            viewport.context.translate(location.x + offset.x, location.y + offset.y);
        } else {
            viewport.context.translate(location.x + (offset.x * -1), location.y + offset.y);
            viewport.context.scale(-1, 1);
        }

        if (this._loaded) {
            viewport.context.drawImage(this._grenadeImage, this._image.width - 8, 0);
        }

        viewport.context.drawImage(this._image, 0, 0);
        viewport.context.resetTransform();
    }

    private timeSinceLastFire(time: FrameTime) { return time.currentTime - this._lastFireTime; }
    private loaded(time: FrameTime) { return this.timeSinceLastFire(time) > this._fireInterval; }
}