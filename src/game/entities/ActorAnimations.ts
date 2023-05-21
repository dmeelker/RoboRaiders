import { AnimationDefinition, AnimationInstance } from "../../utilities/Animation";
import { PhyicalObject } from "../Physics";
import { Facing } from "./PlayerEntity";

export interface ActorAnimations {
    standLeft: AnimationDefinition,
    standRight: AnimationDefinition,
    walkLeft: AnimationDefinition,
    walkRight: AnimationDefinition,
    jumpLeft: AnimationDefinition,
    jumpRight: AnimationDefinition,
    hitLeft?: AnimationDefinition,
    hitRight?: AnimationDefinition,
}

export interface IActor {
    physics: PhyicalObject;
    facing: Facing;
    timeSinceLastHit: number;
}

export class ActorAnimator {
    private readonly _animations: ActorAnimations;
    private _activeAnimation: AnimationInstance;

    public constructor(animations: ActorAnimations) {
        this._animations = animations;
        this._activeAnimation = this._animations.standLeft.newInstance();
    }

    public update(actor: IActor) {
        if (actor.timeSinceLastHit < 100) {
            let animation = actor.facing == Facing.Left ? this._animations.hitLeft : this._animations.hitRight;

            if (animation) {
                this.setAnimation(animation);
                return;
            }
        }

        if (actor.physics.velocity.y != 0) {
            let animation = actor.facing == Facing.Left ? this._animations.jumpLeft : this._animations.jumpRight;
            this.setAnimation(animation);
        } else if (actor.physics.velocity.x == 0) {
            let standAnimation = actor.facing == Facing.Left ? this._animations.standLeft : this._animations.standRight;
            this.setAnimation(standAnimation);
        } else if (actor.physics.velocity.x != 0) {
            let animation = actor.facing == Facing.Left ? this._animations.walkLeft : this._animations.walkRight;
            this.setAnimation(animation);
        }
    }

    private setAnimation(animation: AnimationDefinition) {
        if (this._activeAnimation.definition == animation) {
            return;
        }
        this._activeAnimation = animation.newInstance();
    }

    public get activeAnimation() { return this._activeAnimation; }
}