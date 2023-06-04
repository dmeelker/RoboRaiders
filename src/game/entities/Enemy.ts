import { AnimationInstance } from "../../utilities/Animation";
import { FrameTime } from "../../utilities/FrameTime";
import { interpolate } from "../../utilities/Math";
import { randomArrayElement, randomInt } from "../../utilities/Random";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { Axis, CollisionContext, PhyicalObject } from "../Physics";
import { ActorAnimations, ActorAnimator } from "./ActorAnimations";
import { CorpseEntity } from "./Corpse";
import { Entity } from "./Entity";
import { GoopPuddle } from "./GoopPuddle";
import { Facing, PlayerEntity } from "./PlayerEntity";

export abstract class EnemyEntity extends Entity {
    public physics: PhyicalObject;
    public hitpoints = 10;
    public speed = 200;
    public speedModifier = 1;
    protected get actualSpeed() { return this.speed * this.speedModifier; }
    public gravityOverride?: Vector;
    private _lastHitTime = -1000;
    private _stunTime = -1000;
    private _stunDuration = 0;

    public constructor(location: Vector, size: Size, gameContext: IGameContext) {
        super(location, size, gameContext);

        this.physics = new PhyicalObject(
            this, Vector.zero,
            new CollisionContext(this.context.level, this.context.entityManager),
            entity => entity instanceof GoopPuddle);
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
            this.physics.velocity.x -= this.actualSpeed;
            this.physics.velocity.x = Math.max(this.physics.velocity.x, -this.actualSpeed);
        }
    }

    public moveRight() {
        if (this.physics.onGround) {
            this.physics.velocity.x += this.actualSpeed;
            this.physics.velocity.x = Math.min(this.physics.velocity.x, this.actualSpeed);
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

        this.checkGoopCollisions();

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

    private checkGoopCollisions() {
        if (this.physics.lastCollisions.filter(c => c.entity instanceof GoopPuddle).length > 0) {
            this.speedModifier = 0.2;
        } else {
            this.speedModifier = 1;
        }
    }

    protected get activeAnimationImage() { return this._animator.activeAnimation.getImage(); }
}

export class FlyingEnemyEntity extends EnemyEntity {
    static readonly MODE_WANDER = "wander";
    static readonly MODE_PLAYER = "player";
    static readonly MODE_SCAN = "scan";

    private _mode = FlyingEnemyEntity.MODE_WANDER;
    private _modeStartTime = 0;

    private readonly _animationNormal: AnimationInstance;
    private readonly _animationHit: AnimationInstance;
    private _animation: AnimationInstance;
    private _target: PlayerEntity | Vector | null = null;

    public constructor(location: Vector, context: IGameContext) {
        super(location, new Size(context.resources.animations.flyer.frames[0].width, context.resources.animations.flyer.frames[0].height), context);
        this._animationNormal = this.context.resources.animations.flyer.newInstance();
        this._animationHit = this.context.resources.animations.flyerHit.newInstance();
        this._animation = this._animationNormal;

        this.physics.gravity = false;
        this.physics.collidesWithLevel = false;
        this.switchMode(this.getRandomMode());
    }

    public update(time: FrameTime) {
        this._animation = this.timeSinceLastHit < 100 ? this._animationHit : this._animationNormal;

        if (this.modeDurationPassed) {
            this.toggleMode();
        }

        if (this._target == null) {
            this._target = this.findTarget();
        }

        if (this._target) {
            this.moveTowardsTarget();
        }

        this.physics.gravity = this.gravityOverride != null;

        super.update(time);
    }

    private findTarget(): Vector | PlayerEntity | null {
        if (this._mode == FlyingEnemyEntity.MODE_PLAYER) {
            return this.findPlayerTarget();
        } else if (this._mode == FlyingEnemyEntity.MODE_PLAYER) {
            return this.findRandomTarget();
        } else {
            return null;
        }
    }

    private findPlayerTarget(): PlayerEntity | null {
        let player = this.context.entityManager.getPlayers();
        if (player.length == 0)
            return null;

        return player[0];
    }

    private findRandomTarget(): Vector {
        let x = randomInt(20, this.context.viewport.size.width - 40);
        let y = randomInt(20, this.context.viewport.size.height - 40);

        return new Vector(x, y);
    }

    private moveTowardsTarget() {
        let target = this._target;
        if (target == null)
            return;

        let direction: Vector;
        if (target instanceof PlayerEntity) {
            let distance = target.centerLocation.subtract(this.centerLocation);
            direction = distance.toUnit();
        } else if (target instanceof Vector) {
            let distance = target.subtract(this.centerLocation).length;
            if (distance < 10) {
                this._target = null;
                return;
            }

            direction = target.subtract(this.centerLocation).toUnit();
        } else {
            return;
        }

        let velocity = direction.multiplyScalar(this.actualSpeed);
        this.physics.velocity = velocity;
    }

    private switchMode(mode: string) {
        this._mode = mode;
        this._modeStartTime = this.context.time.currentTime;
    }

    private toggleMode() {
        if (this._mode == FlyingEnemyEntity.MODE_WANDER) {
            this.switchMode(FlyingEnemyEntity.MODE_SCAN);
        } else if (this._mode == FlyingEnemyEntity.MODE_SCAN) {
            this.switchMode(FlyingEnemyEntity.MODE_PLAYER);
        } else {
            this.switchMode(FlyingEnemyEntity.MODE_WANDER);
        }
        this._target = null;
    }

    private getRandomMode() {
        return randomArrayElement([FlyingEnemyEntity.MODE_WANDER, FlyingEnemyEntity.MODE_PLAYER, FlyingEnemyEntity.MODE_SCAN]);
    }

    protected get activeAnimationImage() { return this._animation.getImage(); }
    private get modeDurationPassed() {
        let modeDuration = this.context.time.currentTime - this._modeStartTime;

        if (this._mode == FlyingEnemyEntity.MODE_WANDER) {
            return modeDuration > 10000;
        } else if (this._mode == FlyingEnemyEntity.MODE_SCAN) {
            return modeDuration > 3000;
        } else if (this._mode == FlyingEnemyEntity.MODE_PLAYER) {
            return modeDuration > 5000;
        } else {
            return false;
        }
    }
}