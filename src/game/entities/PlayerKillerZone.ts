import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { Entity } from "./Entity";

export class PlayerZoneKillerEntity extends Entity {
    public constructor(location: Vector, size: Size, context: IGameContext) {
        super(location, size, context);
    }

    public update(_time: FrameTime) {
        this.context.entityManager.getPlayers()
            .filter(p => p.bounds.overlaps(this.bounds))
            .forEach(p => p.die());
    }

    public render(viewport: Viewport) {
        if (this.context.debugMode) {
            viewport.context.fillStyle = "red";
            viewport.context.fillRect(this.location.x, this.location.y, this.size.width, this.size.height);
        }
    }
}