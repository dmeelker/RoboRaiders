import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { CollisionContext, PhyicalObject } from "../Physics";
import { Player } from "../Player";
import { MachineGunWeapon } from "../weapons/MachineGun";
import { PistolWeapon } from "../weapons/Pistol";
import { Entity } from "./Entity";
import { PriceEntity } from "./PrizeEntity";

export enum Facing {
    Left,
    Right,
}

export class PlayerEntity extends Entity {
    private readonly _player: Player;
    public physics: PhyicalObject;
    private _facing = Facing.Left;
    private _weaponOffset = new Vector(2, -1);
    private _weapon = new MachineGunWeapon();


    public constructor(location: Vector, player: Player, gameContext: IGameContext) {
        super(location, new Size(20, 20), gameContext);
        this._player = player;

        this.physics = new PhyicalObject(this, Vector.zero, new CollisionContext(this.context.level, this.context.entityManager));
    }

    public update(time: FrameTime) {
        this.physics.update(time);

        let prizes = this.context.entityManager.getOfType(PriceEntity);
        for (let prize of prizes) {
            if (prize.bounds.overlaps(this.bounds)) {
                prize.markDisposable();
                this._player.addPoint();
            }
        }
    }

    public fire(time: FrameTime) {
        this._weapon.fire(this.weaponLocation, this.lookVector, this.context, time);
    }

    public jump() {
        if (this.physics.onGround) {
            this.physics.velocity.y = -300;
        }
    }

    public moveLeft() {
        this.physics.velocity.x = -200;
        this._facing = Facing.Left;
    }

    public moveRight() {
        this.physics.velocity.x = 200;
        this._facing = Facing.Right;
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "green";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);

        this._weapon.render(this.weaponLocation, this.lookVector, viewport);
    }

    private get weaponLocation() { return this.centerLocation.add(this._facing == Facing.Right ? this._weaponOffset : this._weaponOffset.mirrorX()); }

    public get facing() { return this._facing; }

    public get lookVector() {
        switch (this._facing) {
            case Facing.Left:
                return Vector.left;
            case Facing.Right:
                return Vector.right;
        }
    }
}