import { FrameTime } from "../../utilities/FrameTime";
import { Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { PlayerEntity } from "../entities/PlayerEntity";

export abstract class Weapon {
    private _triggerDown = false;
    private _triggerDownLastFrame = false;

    protected readonly player: PlayerEntity;
    protected readonly context: IGameContext;
    public abstract get name(): string;

    public constructor(player: PlayerEntity, context: IGameContext) {
        this.player = player;
        this.context = context;
    }

    public update(time: FrameTime): void {
        if (this._triggerDown) {
            if (!this._triggerDownLastFrame) {
                this.fireSingleShot(this.player.weaponLocation, this.player.lookVector, this.context, time);
            } else {
                this.fireContinually(this.player.weaponLocation, this.player.lookVector, this.context, time)
            }
        }

        this._triggerDownLastFrame = this._triggerDown;
    }

    public triggerDown(_time: FrameTime) {
        this._triggerDown = true;
    }

    public triggerReleased(_time: FrameTime) {
        this._triggerDown = false;
    }

    public fireSingleShot(_location: Vector, _direction: Vector, _context: IGameContext, _time: FrameTime): void { }
    public fireContinually(_location: Vector, _direction: Vector, _context: IGameContext, _time: FrameTime): void { }
    public abstract render(location: Vector, direction: Vector, viewport: Viewport): void;
}