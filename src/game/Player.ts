import { InputProvider, Keys } from "../input/InputProvider";
import { FrameTime } from "../utilities/FrameTime";
import { Vector } from "../utilities/Trig";
import { IGameContext } from "./Game";
import { PlayerEntity } from "./entities/PlayerEntity";

export class Player {
    private _entity: PlayerEntity;
    // private _score = 0;
    private readonly _input: InputProvider;

    public constructor(location: Vector, input: InputProvider, index: number, context: IGameContext) {
        this._input = input;
        this._entity = new PlayerEntity(location, this, index, context);
    }

    public update(time: FrameTime) {
        this.processInput(time);
    }

    private processInput(time: FrameTime) {
        if (this._input.isButtonDown(Keys.A)) {
            this.entity.jump();
        } else {
            this.entity.stopJump();
        }

        if (this._input.isButtonDown(Keys.B)) {
            this.entity.fire(time);
        }

        if (this._input.isButtonDown(Keys.MoveLeft)) {
            this.entity.moveLeft();
        } else if (this._input.isButtonDown(Keys.MoveRight)) {
            this.entity.moveRight();
        } else {
            this.entity.physics.velocity.x = 0;
        }
    }

    // public addPoint() {
    //     this._score++;
    // }

    // public get score() { return this._score; }
    public get entity() { return this._entity; }
}