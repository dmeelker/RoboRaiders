import { FrameTime } from "../../utilities/FrameTime";
import { Rectangle, Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { EntityManager } from "./EntityManager";

export class Entity {
    private _location: Vector;
    private _size: Size;
    private _disposable = false;
    public manager: EntityManager = null!;

    public constructor(location: Vector, size: Size) {
        this._location = location;
        this._size = size;
    }

    public update(_time: FrameTime) {

    }

    public render(_viewport: Viewport) {

    }

    public onDispose(_time: FrameTime) {

    }

    public set location(newLocation: Vector) {
        this._location = newLocation;
    }

    public get location() { return this._location; }
    public get size() { return this._size; }
    public get width() { return this._size.width; }
    public get height() { return this._size.height; }
    public get bounds() { return new Rectangle(this._location.x, this._location.y, this._size.width, this._size.height); }
    public get centerLocation() { return new Vector(this._location.x + (this._size.width / 2), this._location.y + (this._size.height / 2)) }

    public get disposable() { return this._disposable; }
    public markDisposable() { this._disposable = true; }
}
