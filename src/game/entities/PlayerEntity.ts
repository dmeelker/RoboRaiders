import { AnimationDefinition, AnimationInstance } from "../../utilities/Animation";
import { FrameTime } from "../../utilities/FrameTime";
import { randomArrayElement } from "../../utilities/Random";
import { Point, Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { Player } from "../Player";
import { MachineGunWeapon } from "../weapons/MachineGun";
import { PistolWeapon } from "../weapons/Pistol";
import { ShotgunWeapon } from "../weapons/Shotgun";
import { Weapon } from "../weapons/Weapon";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { PriceEntity } from "./PrizeEntity";

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
    private readonly _player: Player;
    public physics: PhyicalObject;
    private _facing = Facing.Left;
    private _weaponOffset = new Vector(2, -1);
    private _weapon: Weapon = new PistolWeapon();
    private _jumpStart = 0;
    private _jumping = false;
    private _dead = false;
    private _availableWeapons: Array<Weapon>;

    private _animations: PlayerAnimation;
    private _activeAnimation: AnimationInstance = null!;

    public constructor(location: Vector, player: Player, gameContext: IGameContext) {
        super(location, new Size(32, 34), gameContext);
        this._availableWeapons = [new PistolWeapon(), new MachineGunWeapon(), new ShotgunWeapon(gameContext)];
        this._weapon = new ShotgunWeapon(gameContext);
        this._player = player;

        this._animations = {
            standLeft: gameContext.resources.animations.player1StandLeft,
            standRight: gameContext.resources.animations.player1StandRight,
            walkLeft: gameContext.resources.animations.player1WalkLeft,
            walkRight: gameContext.resources.animations.player1WalkRight,
            jumpLeft: gameContext.resources.animations.player1JumpLeft,
            jumpRight: gameContext.resources.animations.player1JumpRight
        };

        this._activeAnimation = this._animations.standLeft.newInstance();

        this.physics = new PhyicalObject(
            this,
            Vector.zero,
            new CollisionContext(this.context.level, this.context.entityManager));
    }

    public update(time: FrameTime) {
        this.updateJump(time);
        this.physics.update(time);
        this.physics.gravity = !this._jumping;

        let enemies = this.context.entityManager.getOfType(EnemyEntity);
        for (let enemy of enemies) {
            if (enemy.bounds.overlaps(this.bounds)) {
                this.die();
            }
        }

        let prizes = this.context.entityManager.getOfType(PriceEntity);
        for (let prize of prizes) {
            if (prize.bounds.overlaps(this.bounds)) {
                prize.markDisposable();
                this._player.addPoint();
                this.randomWeapon();
            }
        }

        if (this.physics.velocity.y != 0) {
            let animation = this.facing == Facing.Left ? this._animations.jumpLeft : this._animations.jumpRight;
            this.setAnimation(animation);
        } else if (this.physics.velocity.x == 0) {
            let standAnimation = this.facing == Facing.Left ? this._animations.standLeft : this._animations.standRight;
            this.setAnimation(standAnimation);
        } else if (this.physics.velocity.x != 0) {
            let animation = this.facing == Facing.Left ? this._animations.walkLeft : this._animations.walkRight;
            this.setAnimation(animation);
        }
    }

    private setAnimation(animation: AnimationDefinition) {
        if (this._activeAnimation.definition == animation) {
            return;
        }
        this._activeAnimation = animation.newInstance();
    }

    private randomWeapon() {
        this._weapon = randomArrayElement(this._availableWeapons);
    }

    private die() {
        this._dead = true;
        this.markDisposable();
    }

    public fire(time: FrameTime) {
        this._weapon.fire(this.weaponLocation, this.lookVector, this.context, time);
    }

    public jump() {
        this._jumping = true;
    }

    public stopJump() {
        this._jumping = false;
    }

    private updateJump(time: FrameTime) {
        if (!this._jumping) {
            return;
        }

        const jumpSpeed = 400;

        if (this.physics.onGround) {
            this._jumpStart = time.currentTime;
            this.physics.velocity.y = -jumpSpeed;
        } else {
            const timeSinceJump = time.currentTime - this._jumpStart;
            if (timeSinceJump > 170) {
                if (timeSinceJump < 200) {
                    this.physics.velocity.y = -jumpSpeed;
                }
                else {
                    this._jumping = false;
                }
            }
        }
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
        //viewport.context.fillStyle = "green";
        //viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
        this._activeAnimation.render(viewport.context, new Point(Math.floor(this.location.x), Math.floor(this.location.y)));
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
}