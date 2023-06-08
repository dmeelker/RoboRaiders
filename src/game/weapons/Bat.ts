import { FrameTime } from "../../utilities/FrameTime";
import { Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { BatSwingEntity } from "../entities/BatSwing";
import { PlayerEntity } from "../entities/PlayerEntity";
import { Weapon } from "./Weapon";

export class BatWeapon extends Weapon {
    private readonly _image: ImageBitmap;
    private _lastSwingTime = -1000;
    public get name() { return "Baseball Bat"; }

    public constructor(player: PlayerEntity, context: IGameContext) {
        super(player, context)

        this._image = context.resources.images.bat;
    }

    public fireSingleShot(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void {
        let offset = direction.x > 0 ? new Vector(30, 3) : new Vector(-30, 3);

        let projectile = new BatSwingEntity(location.add(offset), time, direction, context);
        context.entityManager.add(projectile);
        this._lastSwingTime = time.currentTime;
        context.resources.audio.bat.play();
    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        let offset = new Vector(4, -8); //.add(this._offset);

        if (direction.x > 0) {
            viewport.context.translate(location.x + offset.x, location.y + offset.y);

            if (!this.justSwung)
                viewport.context.scale(-1, 1);
        } else {
            viewport.context.translate(location.x + (offset.x * -1), location.y + offset.y);
            if (this.justSwung)
                viewport.context.scale(-1, 1);
        }
        viewport.context.drawImage(this._image, 0, 0);

        viewport.context.resetTransform();
    }

    private get justSwung() { return this.context.time.currentTime - this._lastSwingTime < 100; }
}