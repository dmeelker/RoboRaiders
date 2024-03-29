import { FrameTime } from "../../utilities/FrameTime";
import { ILocation } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";
import { PlayerEntity } from "./PlayerEntity";

export class EntityManager {
    private _entities = new Array<Entity>();

    public add(entity: Entity) {
        this._entities.push(entity);
    }

    public remove(entity: Entity) {
        this._entities.splice(this._entities.indexOf(entity), 1);
    }

    public clear() {
        this._entities = [];
    }

    public update(time: FrameTime) {
        for (let entity of this._entities) {
            entity.update(time);

            if (entity.disposable) {
                this.remove(entity);
                entity.dispose(time);
            }
        }
    }

    public render(viewport: Viewport) {
        for (let entity of this._entities) {
            entity.render(viewport);
        }
    }

    public getEnemies(): EnemyEntity[] {
        return this._entities.filter(e => e instanceof EnemyEntity).map(e => e as EnemyEntity);
    }

    public getPlayers(): PlayerEntity[] {
        return this._entities.filter(e => e instanceof PlayerEntity).map(e => e as PlayerEntity);
    }

    public * getFiltered(filter: (entity: Entity) => boolean) {
        for (let entity of this._entities) {
            if (filter(entity)) {
                yield entity;
            }
        }
    }

    public * getOfType<T extends Entity>(cls: new (...a: any) => T) {
        //let result = new Array<T>();

        for (let entity of this._entities) {
            if (entity instanceof cls) {
                yield entity;
                //result.push(entity);
            }
        }

        //return result;
    }

    public * getAtLocation(location: ILocation) {
        for (let entity of this._entities) {
            if (entity.bounds.containsPoint(location)) {
                yield entity;
            }
        }
    }
}