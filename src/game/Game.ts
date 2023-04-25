import { GameContext } from "../GameContext";
import { AudioResources, ImageResources } from "../Main";
import { InputProvider, Keys } from "../input/InputProvider";
import { FrameTime } from "../utilities/FrameTime";
import { Vector } from "../utilities/Trig";
import { Viewport } from "../utilities/Viewport";
import { EntityManager } from "./entities/EntityManager";
import { PlayerEntity } from "./entities/PlayerEntity";

export class Game {
    private readonly _context: GameContext;
    private readonly _entities = new EntityManager();
    private _player: PlayerEntity = null!;

    public constructor(context: GameContext) {
        this._context = context;
    }

    public initialize(_time: FrameTime) {
        this._player = new PlayerEntity(new Vector(200, 200));
        this._entities.add(this._player);
    }

    public update(time: FrameTime) {
        if (this.input.wasButtonPressedInFrame(Keys.A)) {
            this._player.jump();
        }
        if (this.input.isButtonDown(Keys.MoveLeft)) {
            this._player.moveLeft();
        } else if (this.input.isButtonDown(Keys.MoveRight)) {
            this._player.moveRight();
        } else {
            this._player.physics.velocity.x = 0;
        }

        this._entities.update(time);
    }

    public render() {
        this.viewport.clearCanvas();

        this.viewport.context.beginPath();
        this.viewport.context.fillStyle = "pink";
        this.viewport.context.fillRect(100, 100, 200, 200);

        this._entities.render(this.viewport);
    }

    private get viewport(): Viewport { return this._context.viewport; }
    private get input(): InputProvider { return this._context.input; }
    private get images(): ImageResources { return this._context.images; }
    private get audio(): AudioResources { return this._context.audio; }
}