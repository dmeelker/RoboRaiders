import { FrameTime } from "../../utilities/FrameTime";
import { Viewport } from "../../utilities/Viewport";
import { Entity } from "./Entity";

export class EntityManager {
    private readonly _entities = new Array<Entity>();

    public add(entity: Entity) {
        this._entities.push(entity);
    }

    public remove(entity: Entity) {
        this._entities.splice(this._entities.indexOf(entity), 1);
    }

    public update(time: FrameTime) {
        for (let entity of this._entities) {
            entity.update(time);
        }
    }

    public render(viewport: Viewport) {
        for (let entity of this._entities) {
            entity.render(viewport);
        }
    }
}