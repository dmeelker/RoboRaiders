import { AnimationDefinition } from "../../utilities/Animation";
import { FrameTime } from "../../utilities/FrameTime";
import { randomInt } from "../../utilities/Random";
import { Point, Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { Player } from "../Player";
import { BoxCollectedEvent, PlayerDiedEvent } from "../modes/Events";
import { PistolWeapon } from "../weapons/Pistol";
import { Weapon } from "../weapons/Weapon";
import { ActorAnimations, ActorAnimator } from "./ActorAnimations";
import { BoxEntity } from "./BoxEntity";
import { CorpseEntity } from "./Corpse";
import { Entity } from "./Entity";

export enum Facing {
    Left,
    Right,
}

export interface PlayerAnimation {
    standLeft: AnimationDefinition,
    standRight: AnimationDefinition,
    walkLeft: AnimationDefinition,
    walkRight: AnimationDefinition,
    jumpLeft: AnimationDefinition,
    jumpRight: AnimationDefinition,
}

export class PlayerEntity extends Entity {
    public physics: PhyicalObject;
    private _facing = Facing.Left;
    private _weaponOffset = new Vector(0, 0);
    private _weapon: Weapon;
    private _weaponEquipTime = 0;
    private _weaponEquippedWasNew = false;
    private _jumpStart = 0;
    private _jumpButtonDown = false;
    private _jumpButtonDownTime = 0;
    private _jumping = false;
    private _lastMoveTime = 0;
    private _lastActionTime = 0;

    private _dead = false;

    private _animator: ActorAnimator;
    private _animations: ActorAnimations;

    public constructor(location: Vector, _player: Player, index: number, gameContext: IGameContext) {
        super(location, new Size(32, 34), gameContext);

        this._lastMoveTime = gameContext.time.currentTime;
        this._lastActionTime = gameContext.time.currentTime;

        this._weapon = new PistolWeapon(this, gameContext);

        if (index == 0) {
            this._animations = {
                standLeft: gameContext.resources.animations.player1StandLeft,
                standRight: gameContext.resources.animations.player1StandRight,
                walkLeft: gameContext.resources.animations.player1WalkLeft,
                walkRight: gameContext.resources.animations.player1WalkRight,
                jumpLeft: gameContext.resources.animations.player1JumpLeft,
                jumpRight: gameContext.resources.animations.player1JumpRight
            };
        } else {
            this._animations = {
                standLeft: gameContext.resources.animations.player2StandLeft,
                standRight: gameContext.resources.animations.player2StandRight,
                walkLeft: gameContext.resources.animations.player2WalkLeft,
                walkRight: gameContext.resources.animations.player2WalkRight,
                jumpLeft: gameContext.resources.animations.player2JumpLeft,
                jumpRight: gameContext.resources.animations.player2JumpRight
            };
        }

        this._animator = new ActorAnimator(this._animations);

        this.physics = new PhyicalObject(
            this,
            Vector.zero,
            new CollisionContext(this.context.level, this.context.entityManager));
    }

    public update(time: FrameTime) {
        this._weapon.update(time);
        this.updateJump(time);
        this.physics.update(time);

        let enemies = this.context.entityManager.getEnemies();
        for (let enemy of enemies) {
            if (enemy.bounds.overlaps(this.bounds)) {
                this.die();
            }
        }

        let boxes = this.context.entityManager.getOfType(BoxEntity);
        for (let box of boxes) {
            if (box.bounds.overlaps(this.bounds)) {
                this.onBoxCollected(box);
            }
        }

        this._animator.update({
            physics: this.physics,
            facing: this.facing,
            timeSinceLastHit: 0
        });
    }

    private onBoxCollected(box: BoxEntity) {
        this.context.resources.audio.box.play();
        this.context.eventSink.handleEvent(new BoxCollectedEvent(this, this.context.time));
        box.markDisposable();
    }

    public equipWeapon(weapon: Weapon, newWeapon: boolean) {
        this._weapon.dispose();
        this._weapon = weapon;
        this._weaponEquipTime = this.context.time.currentTime;
        this._weaponEquippedWasNew = newWeapon;
    }

    public die() {
        this.context.resources.audio.dead.play();
        this._dead = true;
        let corpseVector = Vector.fromDegreeAngle(randomInt(0, 360)).multiplyScalar(randomInt(200, 300));
        this.context.entityManager.add(new CorpseEntity(this.location, corpseVector, this._animator.activeAnimation.getImage(), this.context));
        this._weapon.dispose();
        this.markDisposable();

        this.context.eventSink.handleEvent(new PlayerDiedEvent(this, this.context.time));
    }

    public weaponTriggerDown(time: FrameTime) {
        this._weapon.triggerDown(time);
        this._lastActionTime = time.currentTime;
    }

    public weaponTriggerReleased(time: FrameTime) {
        this._weapon.triggerReleased(time);
        this._lastActionTime = time.currentTime;
    }

    public jump(time: FrameTime) {
        this._jumpButtonDown = true;
        this._jumpButtonDownTime = time.currentTime;
        this._lastActionTime = time.currentTime;
    }

    public stopJump() {
        this._jumpButtonDown = false;
    }

    private updateJump(time: FrameTime) {
        if (this.physics.velocity.y > 0) {
            this.physics.gravityModifier = 1.5;
        } else {
            this.physics.gravityModifier = 1;
        }

        const jumpSpeed = 500;
        const maxJumpLength = 250;

        if (!this._jumping && this.timeSinceJumpButtonDown(time) < 50 && this.timeSinceGrounded(time) < 100) {
            this._jumping = true;
            this._jumpStart = time.currentTime;
            this.physics.velocity.y = -jumpSpeed;
            this.context.resources.audio.jump.play();
        }
        else if (this._jumping) {
            const timeSinceJump = time.currentTime - this._jumpStart;
            if (timeSinceJump >= maxJumpLength || !this._jumpButtonDown) {
                this.physics.velocity.y *= 0.5;
                this._jumping = false;
            } else {
                let boostPower = 1000 * (1 - (timeSinceJump / maxJumpLength));
                this.physics.velocity.y -= time.calculateMovement(boostPower);
                //console.log(boostPower + " - " + time.calculateMovement(boostPower));
            }
        }
    }

    private timeSinceJumpButtonDown(time: FrameTime) {
        return time.currentTime - this._jumpButtonDownTime;
    }

    private timeSinceGrounded(time: FrameTime) {
        return time.currentTime - this.physics.onGroundTime;
    }

    public moveLeft() {
        this.physics.velocity.x = -300;
        this._facing = Facing.Left;
        this._lastMoveTime = this.context.time.currentTime;
    }

    public moveRight() {
        this.physics.velocity.x = 300;
        this._facing = Facing.Right;
        this._lastMoveTime = this.context.time.currentTime;
    }

    public render(viewport: Viewport) {
        this._animator.activeAnimation.render(viewport.context, new Point(Math.floor(this.location.x), Math.floor(this.location.y)));
        this._weapon.render(this.weaponLocation, this.lookVector, viewport);

        if (this.showWeaponEquippedLabel) {
            let nameLabel = this._weapon.name.toUpperCase();
            let nameSize = this.context.resources.fonts.small.calculateSize(nameLabel);

            let y = this.location.y - nameSize.height;

            if (this._weaponEquippedWasNew) {
                let newWeaponLabel = "NEW WEAPON!";
                let newWeaponSize = this.context.resources.fonts.small.calculateSize(newWeaponLabel);
                let location = new Point(this.centerLocation.x - (newWeaponSize.width / 2), y);
                this.context.resources.fonts.small.render(viewport, newWeaponLabel, location);
                y += nameSize.height;
            }

            {
                let location = new Point(this.centerLocation.x - (nameSize.width / 2), y);
                this.context.resources.fonts.small.render(viewport, nameLabel, location);
            }
        }
    }

    private get showWeaponEquippedLabel() { return this.context.time.currentTime - this._weaponEquipTime < (this._weaponEquippedWasNew ? 2000 : 1000); }

    public get weapon() { return this._weapon; }
    public get weaponLocation() { return this.centerLocation.add(this._facing == Facing.Right ? this._weaponOffset : this._weaponOffset.mirrorX()); }

    public get facing() { return this._facing; }
    public get dead() { return this._dead; }
    public get lastMoveTime() { return this._lastMoveTime; }
    public get lastActionTime() { return this._lastActionTime; }

    public get lookVector() {
        switch (this._facing) {
            case Facing.Left:
                return Vector.left;
            case Facing.Right:
                return Vector.right;
        }
    }
}