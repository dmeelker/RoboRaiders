import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { PlayerEntity } from "./PlayerEntity";

export enum GateDirection {
    Left,
    Right,
}

export class Gate extends Entity {
    private _direction: GateDirection;
    public _matchingGate?: Gate;

    public constructor(location: Vector, direction: GateDirection, context: IGameContext) {
        super(location, new Size(32 + 2, 32 * 2), context);

        this._direction = direction;
    }

    public update(_time: FrameTime) {
        let enemies = this.context.entityManager.getOfType(EnemyEntity);
        // let players = this.context.entityManager.getOfType(PlayerEntity);

        for (let enemy of enemies) {
            if (this.bounds.containsRect(enemy.bounds)) {
                this.moveEntity(enemy);
            }
        }

        // for (let player of players) {
        //     if (this.bounds.containsRect(player.bounds)) {
        //         this.moveEntity(player);
        //     }
        // }
    }

    private moveEntity(entity: Entity) {
        if (!this._matchingGate)
            return;

        let entranceOffset = entity.location.subtract(this.location);
        let exitOffset = this._direction == GateDirection.Right ? new Vector(4, 0) : new Vector(-4, 0);
        entity.location = this._matchingGate.location.add(exitOffset).add(entranceOffset);
    }

    public render(viewport: Viewport) {
        //viewport.context.fillStyle = "orange";
        //viewport.context.fillRect(this.location.x, this.location.y, this.size.width, this.size.height);
    }
}