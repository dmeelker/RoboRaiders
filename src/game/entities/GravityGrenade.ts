import { FrameTime } from "../../utilities/FrameTime";
import { interpolate } from "../../utilities/Math";
import { Emitter } from "../../utilities/Particles";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { createSingularityEmitter } from "../ParticleFactory";
import { CollisionContext, PhyicalObject } from "../Physics";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { ExplosionEntity } from "./Explosion";

enum GravityGrenadeState {
    Thrown,
    Armed
}

export class GravityGrenadeEntity extends Entity {
    public physics: PhyicalObject;
    private _radius = 100;
    private _imageUnarmed: ImageBitmap;
    private _imageArmed: ImageBitmap;
    private _state = GravityGrenadeState.Thrown;
    private _particleEmitter?: Emitter;

    public constructor(location: Vector, velocity: Vector, time: FrameTime, gameContext: IGameContext) {
        super(location, new Size(4, 4), gameContext);

        this._imageUnarmed = gameContext.resources.images.gravityGrenadeUnarmed;
        this._imageArmed = gameContext.resources.images.gravityGrenadeArmed;
        this.size = new Size(this._imageUnarmed.width, this._imageUnarmed.height);

        this.physics = new PhyicalObject(
            this,
            velocity,
            new CollisionContext(this.context.level, this.context.entityManager),
            entity => entity instanceof EnemyEntity);
        this.physics.gravity = true;
        this.physics.groundDrag = 1000;
    }

    public update(time: FrameTime) {
        this.updateState();
        this.physics.update(time);

        if (this.age > 3000) {
            this.detonate(time);
        }
    }

    private updateState() {
        if (this.age < 1000) {
            this._state = GravityGrenadeState.Thrown;
        } else {
            if (this._state != GravityGrenadeState.Armed) {
                this._particleEmitter = createSingularityEmitter(this.context.particleSystem, this.centerLocation, this._radius, this.context.time);
                this.context.resources.audio.singularitygrenade.play();
            }
            this._state = GravityGrenadeState.Armed;
        }
    }

    private detonate(time: FrameTime) {
        let explosion = new ExplosionEntity(this.centerLocation, time, this.context);
        this.context.entityManager.add(explosion);

        if (this._particleEmitter)
            this.context.particleSystem.removeEmitter(this._particleEmitter);

        this.markDisposable();
    }

    public render(viewport: Viewport) {
        viewport.context.drawImage(this._state == GravityGrenadeState.Thrown ? this._imageUnarmed : this._imageArmed, this.location.x, this.location.y, this.size.width, this.size.height);
    }

    public static updateGravityPull(gameContext: IGameContext) {
        let enemies = gameContext.entityManager.getEnemies();
        let gravityGrenades = Array.from(gameContext.entityManager.getOfType(GravityGrenadeEntity)).filter(g => g._state == GravityGrenadeState.Armed);

        for (let enemy of enemies) {
            let gravityPull = new Vector(0, 0);
            for (let grenade of gravityGrenades) {
                let distance = enemy.location.distanceTo(grenade.centerLocation);
                if (distance < grenade._radius) {
                    let v = grenade.centerLocation.subtract(enemy.location).toUnit();
                    let distanceFactor = 1 - (distance / grenade._radius);
                    gravityPull = gravityPull.add(v.multiplyScalar(interpolate(20000, 30000, distanceFactor)));
                }
            }

            if (gravityPull.x != 0 || gravityPull.y != 0) {
                enemy.gravityOverride = gravityPull;
            } else {
                enemy.gravityOverride = undefined;
            }
        }
    }
}