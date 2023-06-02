import { FrameTime } from "../../utilities/FrameTime";
import { interpolate } from "../../utilities/Math";
import { randomInt } from "../../utilities/Random";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { Axis, CollisionContext, PhyicalObject } from "../Physics";
import { ActorAnimations, ActorAnimator } from "./ActorAnimations";
import { CorpseEntity } from "./Corpse";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

export abstract class EnemyEntity extends Entity {
    public physics: PhyicalObject;
    public hitpoints = 10;
    public speed = 200;
    public gravityOverride?: Vector;
    private _lastHitTime = -1000;
    private _stunTime = -1000;
    private _stunDuration = 0;

    public constructor(location: Vector, size: Size, gameContext: IGameContext) {
        super(location, size, gameContext);

        this.physics = new PhyicalObject(
            this, Vector.zero,
            new CollisionContext(this.context.level, this.context.entityManager));
    }

    public update(time: FrameTime) {
        this.physics.gravityVector = this.gravityOverride || PhyicalObject.defaultGravity;
        this.physics.update(time);
    }

    public render(viewport: Viewport) {
        let location = this.location.floor();
        viewport.context.drawImage(this.activeAnimationImage, location.x, location.y);
    }

    public hit(power: number, vector: Vector | null = null) {
        if (this.disposable)
            return;

        this.hitpoints -= power;
        this._lastHitTime = this.context.time.currentTime;
        this.stun(Math.min(interpolate(50, 200, power / 10), 200));
        this.context.resources.audio.hit.play();

        if (this.hitpoints <= 0) {
            this.die(vector);
        }
    }

    public stun(duration = 500) {
        this._stunTime = this.context.time.currentTime;
        this._stunDuration = duration;
    }

    public push(vector: Vector) {
        this.physics.velocity = this.physics.velocity.add(vector);
    }

    private die(vector: Vector | null = null) {
        let direction = vector?.toUnit() ?? Vector.fromDegreeAngle(randomInt(0, 360));
        let corpseVector = direction.multiplyScalar(randomInt(200, 300));
        this.context.entityManager.add(new CorpseEntity(this.location, corpseVector, this.activeAnimationImage, this.context));
        this.markDisposable();
    }

    protected get timeSinceLastHit() { return this.context.time.currentTime - this._lastHitTime; }
    public get stunned() { return this.context.time.currentTime - this._stunTime < this._stunDuration; }

    protected abstract get activeAnimationImage(): ImageBitmap;
}

export class WalkingEnemyEntity extends EnemyEntity {
    private _facing = Facing.Left;
    private _animator: ActorAnimator;
    public heavy = false;


    public constructor(location: Vector, animations: ActorAnimations, gameContext: IGameContext) {
        super(location, new Size(animations.standLeft.frames[0].width, animations.standLeft.frames[0].height), gameContext);
        this._animator = new ActorAnimator(animations);

        this.physics.groundDrag = 1000;
    }

    public moveLeft() {
        if (this.physics.onGround) {
            this.physics.velocity.x -= this.speed;
            this.physics.velocity.x = Math.max(this.physics.velocity.x, -this.speed);
        }
    }

    public moveRight() {
        if (this.physics.onGround) {
            this.physics.velocity.x += this.speed;
            this.physics.velocity.x = Math.min(this.physics.velocity.x, this.speed);
        }
    }

    private turn() {
        this._facing = this._facing == Facing.Left ? Facing.Right : Facing.Left;
    }

    public get facing() { return this._facing; }
    public set facing(facing: Facing) {
        this._facing = facing;
    }

    public get lookVector() {
        switch (this._facing) {
            case Facing.Left:
                return Vector.left;
            case Facing.Right:
                return Vector.right;
        }
    }

    public update(time: FrameTime) {
        if (!this.stunned) {
            if (this._facing == Facing.Left) {
                this.moveLeft();
            } else {
                this.moveRight();
            }
        }

        super.update(time);

        if (this.heavy && this.physics.groundedThisUpdate) {
            this.context.viewport.shakeLight(time);
        }

        if (this.physics.lastCollisions.filter(c => c.axis == Axis.X && !c.passable).length > 0) {
            this.turn();
        }

        this._animator.update({
            physics: this.physics,
            facing: this.facing,
            timeSinceLastHit: this.timeSinceLastHit
        });
    }

    protected get activeAnimationImage() { return this._animator.activeAnimation.getImage(); }
}

// export class FlyingEnemyEntity extends EnemyEntity {

// }