import { FrameTime } from "../../utilities/FrameTime";
import { interpolate } from "../../utilities/Math";
import { Emitter } from "../../utilities/Particles";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { createSmokeTrailEmitter } from "../ParticleFactory";
import { CollisionContext, PhyicalObject } from "../Physics";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { ExplosionEntity } from "./Explosion";
import { Facing } from "./PlayerEntity";

export class MissileEntity extends Entity {
    private readonly _context: IGameContext
    public physics: PhyicalObject;
    public maxAge?: number;
    private _image: ImageBitmap;
    private _speed = 1;
    private _smokeEmitter: Emitter;

    public constructor(location: Vector, direction: Vector, time: FrameTime, gameContext: IGameContext) {
        super(location, new Size(0, 0), gameContext);

        this._context = gameContext;
        this._image = gameContext.resources.images.rpgGrenade;
        this.size = new Size(this._image.width, this._image.height);

        this.physics = new PhyicalObject(
            this,
            direction,
            new CollisionContext(this.context.level, this.context.entityManager),
            entity => entity instanceof EnemyEntity);
        this.physics.gravity = false;

        this._smokeEmitter = createSmokeTrailEmitter(gameContext.particleSystem, this.centerLocation, time);
        gameContext.resources.audio.rocket.play();
    }

    protected onDispose(_time: FrameTime) {
        this._context.particleSystem.removeEmitter(this._smokeEmitter);
    }

    public update(time: FrameTime) {
        if (this.maxAge && this.age > this.maxAge) {
            this.markDisposable();
            return;
        }

        this.updateSpeed();
        this.physics.update(time);
        this._smokeEmitter.location = this.centerLocation;

        if (this.physics.lastCollisions.length > 0) {
            this.detonate(time);
            this.markDisposable();
        }
    }

    private updateSpeed() {
        this._speed = interpolate(100, 600, this.age / 200);
        this.physics.velocity = this.physics.velocity.toUnit().multiplyScalar(this._speed);
    }

    public detonate(time: FrameTime) {
        let explosion = new ExplosionEntity(this.centerLocation, time, this.context);
        this.context.entityManager.add(explosion);
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

    private get facing() { return this.physics.velocity.x > 0 ? Facing.Right : Facing.Left; }
}