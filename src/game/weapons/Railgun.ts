import { FrameTime } from "../../utilities/FrameTime";
import { Timer } from "../../utilities/Timer";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { createSparkEmitter } from "../ParticleFactory";
import { RailgunDartEntity } from "../entities/RailgunDart";
import { Weapon } from "./Weapon";

export class RailgunWeapon extends Weapon {
    public get name(): string { return "Railgun" }
    private readonly _image: ImageBitmap;
    private readonly _imageLoaded: ImageBitmap;
    private readonly _size: Size;
    private readonly _context: IGameContext;
    private _lastFireTime = -10000;
    private _fireInterval = 3000;
    private _offset = Vector.zero;
    private _recoilTimer?: Timer;
    private _loaded = true;

    public constructor(context: IGameContext) {
        super();
        this._image = context.resources.images.railgun;
        this._imageLoaded = context.resources.images.railgunLoaded;
        this._size = new Size(this._image.width, this._image.height);
        this._context = context;
    }

    public update(time: FrameTime): void {
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

        let offset = direction.x > 0 ? new Vector(this._size.width, 0) : new Vector(this._size.width * -1, 2);
        let fireLocation = location.add(offset);
        let velocity = direction.toUnit().multiplyScalar(1500);
        let projectile = new RailgunDartEntity(fireLocation, velocity, context);
        context.entityManager.add(projectile);

        let sparkLocation = direction.x > 0 ? fireLocation.addX(-this._image.width - 4) : fireLocation.addX(this._image.width + 4);
        sparkLocation = sparkLocation.addY(8);
        this.spawnSparks(sparkLocation, direction.multiplyScalar(-1).toUnit(), time);
        context.resources.audio.railgun.play();
    }

    private spawnSparks(location: Vector, direction: Vector, time: FrameTime) {
        createSparkEmitter(this._context.particleSystem, location, direction, time);
    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        let image = this._loaded ? this._imageLoaded : this._image;
        let offset = new Vector(-10, 4).add(this._offset);

        if (direction.x > 0) {
            viewport.context.translate(location.x + offset.x, location.y + offset.y);
        } else {
            viewport.context.translate(location.x + (offset.x * -1), location.y + offset.y);
            viewport.context.scale(-1, 1);
        }
        viewport.context.drawImage(image, 0, 0);

        viewport.context.resetTransform();
    }

    private timeSinceLastFire(time: FrameTime) { return time.currentTime - this._lastFireTime; }
    private loaded(time: FrameTime) { return this.timeSinceLastFire(time) > this._fireInterval; }
}