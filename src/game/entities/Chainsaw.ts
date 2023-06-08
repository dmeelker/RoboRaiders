import { easeInOutSine } from "../../utilities/Easing";
import { FrameTime } from "../../utilities/FrameTime";
import { interpolate } from "../../utilities/Math";
import { Timer } from "../../utilities/Timer";
import { Size, Vector, degreesToRadians } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { Entity } from "./Entity"
import { Facing, PlayerEntity } from "./PlayerEntity";

export class ChainsawEntity extends Entity {
    private readonly _player: PlayerEntity;
    private _degrees: number;
    private _swingDirection = 1;
    private _distance = 50;
    private _rotationSpeed = 0;
    private _rollbackStartTime = 0;
    private _rollback = false;
    private _soundTimer: Timer;

    private readonly _sawImage: ImageBitmap;
    private readonly _chainImage: ImageBitmap;

    public constructor(location: Vector, player: PlayerEntity, gameContext: IGameContext) {
        super(location, new Size(gameContext.resources.images.chainsaw.width, gameContext.resources.images.chainsaw.height), gameContext);

        this._player = player;
        this._degrees = player.lookVector.angleInDegrees;
        this._swingDirection = player.lookVector.x > 0 ? 1 : -1;
        this._sawImage = gameContext.resources.images.chainsaw;
        this._chainImage = gameContext.resources.images.chainlink;
        this._soundTimer = Timer.createRepeating(250, gameContext.time);
    }

    public update(time: FrameTime) {
        this._soundTimer.update(time, () => this.context.resources.audio.chainsaw.play());

        if (this._rollback && this.rolloutProgress == 1) {
            let progress = this.rollbackProgress;
            if (progress == 1) {
                this.markDisposable();
                return;
            }
            this._distance = interpolate(80, 0, easeInOutSine(progress));
            this._rotationSpeed = interpolate(800, 0, easeInOutSine(progress));
        } else {
            this._distance = interpolate(0, 80, easeInOutSine(this.rolloutProgress));
            this._rotationSpeed = interpolate(0, 800, easeInOutSine(this.rolloutProgress));
        }

        this._degrees += this._swingDirection * time.calculateMovement(this._rotationSpeed);

        this.centerOn(this.chainStartLocation.add(Vector.fromDegreeAngle(this._degrees).multiplyScalar(this._distance)));

        this.context.entityManager.getEnemies()
            .filter(enemy => enemy.bounds.overlaps(this.bounds))
            .forEach(enemy => enemy.hit(5));
    }

    public render(viewport: Viewport) {
        this.renderChain(viewport);

        viewport.context.translate(this.centerLocation.x, this.centerLocation.y);
        viewport.context.rotate(degreesToRadians(this._degrees));
        viewport.context.fillStyle = "red";
        viewport.context.drawImage(this._sawImage, - (this.width / 2), - (this.height / 2));
        viewport.context.resetTransform();
    }

    private renderChain(viewport: Viewport) {
        let distance = this.centerLocation.distanceTo(this.chainStartLocation);
        let step = this.centerLocation.subtract(this.chainStartLocation).toUnit().multiplyScalar(5);
        let steps = distance / 5;

        for (let i = 0; i < steps; i++) {
            this.renderChainLink(viewport, this.chainStartLocation.add(step.multiplyScalar(i)));
        }
    }

    private renderChainLink(viewport: Viewport, location: Vector) {
        viewport.context.translate(location.x, location.y);
        viewport.context.rotate(degreesToRadians(this._degrees));
        viewport.context.fillStyle = "green";
        viewport.context.drawImage(this._chainImage, - (this._chainImage.width / 2), - (this._chainImage.height / 2));
        viewport.context.resetTransform();
    }

    public rollback() {
        this._rollback = true;
        this._rollbackStartTime = this.context.time.currentTime;
    }

    private get chainStartLocation() {
        if (this._player.facing == Facing.Right)
            return this._player.weaponLocation.add(new Vector(0, 5));
        else
            return this._player.weaponLocation.add(new Vector(0, 5));
    }

    public get rolloutProgress() { return Math.min(this.age / 500, 1); }
    public get rollingBack() { return this._rollback; }
    public get rollbackProgress() { return Math.min((this.context.time.currentTime - this._rollbackStartTime) / 300, 1); }
}