import { GameContext } from "../GameContext";
import { AudioResources, ImageResources } from "../Main";
import { InputProvider, Keys } from "../input/InputProvider";
import { FrameTime } from "../utilities/FrameTime";
import { randomInt } from "../utilities/Random";
import { Vector } from "../utilities/Trig";
import { Viewport } from "../utilities/Viewport";
import { Player } from "./Player";
import { EnemyEntity } from "./entities/Enemy";
import { EntityManager } from "./entities/EntityManager";
import { PlayerEntity } from "./entities/PlayerEntity";
import { PriceEntity as PrizeEntity } from "./entities/PrizeEntity";
import { ProjectileEntity } from "./entities/Projectile";

export class Game {
    private readonly _context: GameContext;
    private readonly _entities = new EntityManager();
    private _player: Player = null!;
    private _prize: PrizeEntity = null!;

    public constructor(context: GameContext) {
        this._context = context;
    }

    public initialize(_time: FrameTime) {
        this._player = new Player(new Vector(200, 200));
        this._entities.add(this._player.entity);

        let enemy = new EnemyEntity(new Vector(200, 100));
        this._entities.add(enemy);

        this.spawnPrize();
    }

    private spawnPrize() {
        this._prize = new PrizeEntity(new Vector(randomInt(100, 300), randomInt(100, 300)));
        this._entities.add(this._prize);
    }

    public update(time: FrameTime) {
        if (this.input.isButtonDown(Keys.A)) {
            this._player.entity.jump();
        }

        if (this.input.wasButtonPressedInFrame(Keys.B)) {
            let projectile = new ProjectileEntity(this._player.entity.centerLocation, this._player.entity.lookVector.multiplyScalar(500));
            this._entities.add(projectile);
        }

        if (this.input.isButtonDown(Keys.MoveLeft)) {
            this._player.entity.moveLeft();
        } else if (this.input.isButtonDown(Keys.MoveRight)) {
            this._player.entity.moveRight();
        } else {
            this._player.entity.physics.velocity.x = 0;
        }

        if (this._prize.disposed) {
            this.spawnPrize();
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