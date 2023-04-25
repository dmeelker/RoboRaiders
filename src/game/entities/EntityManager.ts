import { FrameTime } from "../../utilities/FrameTime";
import { Viewport } from "../../utilities/Viewport";
import { Entity } from "./Entity";

export class EntityManager {
    private readonly _entities = new Array<Entity>();

    public add(entity: Entity) {
        entity.manager = this;
        this._entities.push(entity);
    }

    public remove(entity: Entity) {
        this._entities.splice(this._entities.indexOf(entity), 1);
    }

    public update(time: FrameTime) {
        for (let entity of this._entities) {
            entity.update(time);

            if (entity.disposable) {
                this.remove(entity);
                entity.onDispose(time);
            }
        }
    }

    public render(viewport: Viewport) {
        for (let entity of this._entities) {
            entity.render(viewport);
        }
    }

    public getOfType<T extends Entity>(cls: new (...a: any) => T): Array<T> {
        let result = new Array<T>();

        for (let entity of this._entities) {
            if (entity instanceof cls) {
                result.push(entity);
            }
        }

        return result;
    }
}