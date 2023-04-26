import { Vector } from "../utilities/Trig";
import { PlayerEntity } from "./entities/PlayerEntity";

export class Player {
    private _entity: PlayerEntity;
    private _score = 0;

    public constructor(location: Vector) {
        this._entity = new PlayerEntity(location, this);
    }

    public addPoint() {
        this._score++;
    }

    public get entity() { return this._entity; }
}