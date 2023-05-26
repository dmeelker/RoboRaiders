import { AnimationDefinition } from "../../utilities/Animation";
import { FrameTime } from "../../utilities/FrameTime";
import { randomArrayElement, randomInt } from "../../utilities/Random";
import { Point, Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { Player } from "../Player";
import { GravityGrenadeWeapon } from "../weapons/GravityGrenadeLauncher";
import { MachineGunWeapon } from "../weapons/MachineGun";
import { PistolWeapon } from "../weapons/Pistol";
import { RailgunWeapon } from "../weapons/Railgun";
import { RpgWeapon } from "../weapons/Rpg";
import { ShotgunWeapon } from "../weapons/Shotgun";
import { Weapon } from "../weapons/Weapon";
import { ActorAnimations, ActorAnimator } from "./ActorAnimations";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { BoxEntity } from "./BoxEntity";
import * as Dom from "../../utilities/Dom";
import { CorpseEntity } from "./Corpse";

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
    private _weaponNameLabel: HTMLDivElement;
    private _jumpStart = 0;
    private _jumpButtonDown = false;
    private _jumpButtonDownTime = 0;
    private _jumping = false;


    private _dead = false;
    private _availableWeapons: Array<Weapon>;

    private _animator: ActorAnimator;
    private _animations: ActorAnimations;

    public constructor(location: Vector, _player: Player, index: number, gameContext: IGameContext) {
        super(location, new Size(32, 34), gameContext);
        this._availableWeapons = [new PistolWeapon(gameContext), new MachineGunWeapon(gameContext), new ShotgunWeapon(gameContext), new RpgWeapon(gameContext), new RailgunWeapon(gameContext), new GravityGrenadeWeapon(gameContext)];
        this._weapon = new RpgWeapon(gameContext);

        this._weaponNameLabel = document.createElement("div");
        this._weaponNameLabel.className = "weapon-label";
        Dom.setVisible(this._weaponNameLabel, false);
        gameContext.viewport.uiElement.appendChild(this._weaponNameLabel);

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

        let enemies = this.context.entityManager.getOfType(EnemyEntity);
        for (let enemy of enemies) {
            if (enemy.bounds.overlaps(this.bounds)) {
                this.die();
            }
        }

        let boxes = this.context.entityManager.getOfType(BoxEntity);
        for (let box of boxes) {
            if (box.bounds.overlaps(this.bounds)) {
                box.markDisposable();
                this.context.addPoint();
                this.randomWeapon();
            }
        }

        this._animator.update({
            physics: this.physics,
            facing: this.facing,
            timeSinceLastHit: 0
        });

        if (time.currentTime - this._weaponEquipTime < 1000) {
            Dom.position(this._weaponNameLabel, new Point(this.centerLocation.x - (this._weaponNameLabel.clientWidth / 2), this.location.y - this._weaponNameLabel.clientHeight));
            Dom.setVisible(this._weaponNameLabel, true);
        } else {
            Dom.setVisible(this._weaponNameLabel, false);
        }
    }

    private randomWeapon() {
        let originalWeapon = this._weapon;

        while (this._weapon == originalWeapon) {
            this._weapon = randomArrayElement(this._availableWeapons);
        }

        this._weaponEquipTime = this.context.time.currentTime;
        this._weaponNameLabel.innerText = this._weapon.name;
    }

    private die() {
        this._dead = true;
        let corpseVector = Vector.fromDegreeAngle(randomInt(0, 360)).multiplyScalar(randomInt(200, 300));
        this.context.entityManager.add(new CorpseEntity(this.location, corpseVector, this._animator.activeAnimation.getImage(), this.context));
        this.markDisposable();
    }

    public fireShot(time: FrameTime) {
        this._weapon.fireSingleShot(this.weaponLocation, this.lookVector, this.context, time);
    }

    public fireContinually(time: FrameTime) {
        this._weapon.fireContinually(this.weaponLocation, this.lookVector, this.context, time);
    }

    public jump(time: FrameTime) {
        this._jumpButtonDown = true;
        this._jumpButtonDownTime = time.currentTime;
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
    }

    public moveRight() {
        this.physics.velocity.x = 300;
        this._facing = Facing.Right;
    }

    public render(viewport: Viewport) {
        this._animator.activeAnimation.render(viewport.context, new Point(Math.floor(this.location.x), Math.floor(this.location.y)));
        this._weapon.render(this.weaponLocation, this.lookVector, viewport);
    }

    private get weaponLocation() { return this.centerLocation.add(this._facing == Facing.Right ? this._weaponOffset : this._weaponOffset.mirrorX()); }

    public get facing() { return this._facing; }
    public get dead() { return this._dead; }

    public get lookVector() {
        switch (this._facing) {
            case Facing.Left:
                return Vector.left;
            case Facing.Right:
                return Vector.right;
        }
    }

    protected onDispose(_time: FrameTime): void {
        this._weaponNameLabel.remove();
    }
}