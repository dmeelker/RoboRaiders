import { FrameTime } from "../../utilities/FrameTime";
import { randomInt } from "../../utilities/Random";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { ProjectileEntity } from "../entities/Projectile";
import { Weapon } from "./Weapon";

export class ShotgunWeapon extends Weapon {
    private readonly _size = new Size(18, 5);
    private _lastFireTime = 0;
    private _fireInterval = 1000;

    public fire(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void {
        if (time.currentTime - this._lastFireTime >= this._fireInterval) {
            this._lastFireTime = time.currentTime;
        } else {
            return;
        }

        for (let i = 0; i < 8; i++) {
            let speed = randomInt(600, 800);
            let offset = direction.x > 0 ? new Vector(this._size.width, 0) : new Vector(this._size.width * -1, 0);
            let velocity = this.getSpreadVector(direction).toUnit().multiplyScalar(speed);
            let projectile = new ProjectileEntity(location.add(offset), velocity, time, context);
            projectile.maxAge = randomInt(250, 350);
            context.entityManager.add(projectile);
        }

    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        viewport.context.fillStyle = "gray";

        if (direction.x > 0) {
            viewport.context.fillRect(location.x, location.y, this._size.width, this._size.height);
        } else {
            viewport.context.fillRect(location.x - this._size.width, location.y, this._size.width, this._size.height);
        }
    }

    private getSpreadVector(direction: Vector) {
        return Vector.fromDegreeAngle(direction.angleInDegrees + randomInt(-3, 3));
    }
}