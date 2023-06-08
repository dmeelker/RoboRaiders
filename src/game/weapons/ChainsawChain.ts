import { FrameTime } from "../../utilities/FrameTime";
import { Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { ChainsawEntity } from "../entities/Chainsaw";
import { PlayerEntity } from "../entities/PlayerEntity";
import { Weapon } from "./Weapon";

export class ChainsawChain extends Weapon {
    public get name(): string { return "CHAINEDSAW"; }
    private _chainsaw: ChainsawEntity | null = null;
    private readonly _image: ImageBitmap;

    public constructor(player: PlayerEntity, context: IGameContext) {
        super(player, context)
        this._image = context.resources.images.chainsaw;
    }

    public update(time: FrameTime): void {
        if (this.wasTriggerPressedThisFrame) {
            if (this._chainsaw) {
                return;
            }
            this._chainsaw = new ChainsawEntity(this.player.weaponLocation.add(this.player.lookVector.multiplyScalar(50)), this.player, this.context);
            this.context.entityManager.add(this._chainsaw);
        } else if (!this.isTriggerDown && this._chainsaw) {
            if (this._chainsaw.disposed) {
                this._chainsaw = null;
            } else if (!this._chainsaw.rollingBack) {
                this._chainsaw.rollback();
            }
        }

        super.update(time);
    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        if (!this._chainsaw) {
            let offset = new Vector(-5, 2);

            if (direction.x > 0) {
                viewport.context.translate(location.x + offset.x, location.y + offset.y);
            } else {
                viewport.context.translate(location.x + (offset.x * -1), location.y + offset.y);
                viewport.context.scale(-1, 1);
            }

            viewport.context.drawImage(this._image, 0, 0);
            viewport.context.resetTransform();
        }
    }

    public dispose() {
        if (this._chainsaw) {
            this._chainsaw.rollback();
            this._chainsaw = null;
        }
    }
}