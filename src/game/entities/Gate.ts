import { FrameTime } from "../../utilities/FrameTime";
import { between } from "../../utilities/Math";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";

export enum GateDirection {
    Left,
    Right,
}

export class Gate extends Entity {
    private _direction: GateDirection;
    private _entrance: boolean;
    public _matchingGate?: Gate;

    public constructor(location: Vector, direction: GateDirection, entrance: boolean, context: IGameContext) {
        super(location, new Size(32 + 2, 32 * 2), context);

        this._entrance = entrance;
        this._direction = direction;
    }

    public update(_time: FrameTime) {
        if (!this._entrance) {
            return;
        }

        let enemies = this.context.entityManager.getOfType(EnemyEntity);
        // let players = this.context.entityManager.getOfType(PlayerEntity);

        for (let enemy of enemies) {
            if (this.entityOnEdge(enemy)) {
                this.moveEntity(enemy);
            }
        }

        // for (let player of players) {
        //     if (this.bounds.containsRect(player.bounds)) {
        //         this.moveEntity(player);
        //     }
        // }
    }

    private entityOnEdge(entity: Entity): boolean {
        if (this._direction == GateDirection.Left) {
            return entity.location.x == this.location.x && between(entity.location.y, this.location.y, this.location.y + this.bounds.height);
        } else if (this._direction == GateDirection.Right) {
            return entity.location.x + entity.size.width == this.location.x + this.size.width && between(entity.location.y, this.location.y, this.location.y + this.bounds.height);
        }

        return false;
    }

    private moveEntity(entity: Entity) {
        if (!this._matchingGate)
            return;

        let entranceOffset = entity.location.subtract(this.location);
        let exitOffset = this._direction == GateDirection.Right ? new Vector(4, 0) : new Vector(-4, 0);
        entity.location = this._matchingGate.location.add(exitOffset).add(entranceOffset);
    }

    public render(_viewport: Viewport) {
        // viewport.context.fillStyle = "orange";
        // viewport.context.fillRect(this.location.x, this.location.y, this.size.width, this.size.height);
    }
}