import { FrameTime } from "../../utilities/FrameTime";
import { randomInt } from "../../utilities/Random";
import { Point, Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { Axis, CollisionContext, PhyicalObject } from "../Physics";
import { ActorAnimations, ActorAnimator } from "./ActorAnimations";
import { CorpseEntity } from "./Corpse";
import { Entity } from "./Entity";
import { Facing } from "./PlayerEntity";

export class EnemyEntity extends Entity {
    public physics: PhyicalObject;
    public hitpoints = 10;
    private _facing = Facing.Left;
    public speed = 200;
    private _animator: ActorAnimator;
    public gravityOverride?: Vector;
    private _lastHitTime = -1000;
    private _renderOffset = new Vector(0, 0);
    public heavy = false;

    public constructor(location: Vector, animations: ActorAnimations, gameContext: IGameContext) {
        super(location, new Size(animations.standLeft.frames[0].width, animations.standLeft.frames[0].height), gameContext);
        this._animator = new ActorAnimator(animations);

        this.physics = new PhyicalObject(
            this, Vector.zero,
            new CollisionContext(this.context.level, this.context.entityManager));
    }

    public update(time: FrameTime) {
        if (this._facing == Facing.Left) {
            this.moveLeft();
        } else {
            this.moveRight();
        }

        this.physics.gravityVector = this.gravityOverride || PhyicalObject.defaultGravity;

        this.physics.update(time);

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

    public moveLeft() {
        this.physics.velocity.x = -this.speed;
    }

    public moveRight() {
        this.physics.velocity.x = this.speed;
    }

    private turn() {
        this._facing = this._facing == Facing.Left ? Facing.Right : Facing.Left;
    }

    public render(viewport: Viewport) {
        let location = this.location.add(this._renderOffset);
        this._animator.activeAnimation.render(viewport.context, new Point(Math.floor(location.x), Math.floor(location.y)));

        //viewport.context.fillStyle = "yellow";
        //viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }

    public hit(power: number, vector: Vector | null = null) {
        if (this.disposable)
            return;

        this.hitpoints -= power;
        this._lastHitTime = this.context.time.currentTime;
        this.context.resources.audio.hit.play();

        if (this.hitpoints <= 0) {
            this.die(vector);
        }
    }

    private die(vector: Vector | null = null) {
        let direction = vector?.toUnit() ?? Vector.fromDegreeAngle(randomInt(0, 360));
        let corpseVector = direction.multiplyScalar(randomInt(200, 300));
        this.context.entityManager.add(new CorpseEntity(this.location, corpseVector, this._animator.activeAnimation.getImage(), this.context));
        this.markDisposable();
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

    private get timeSinceLastHit() { return this.context.time.currentTime - this._lastHitTime; }
}