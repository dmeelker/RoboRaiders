import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { ProjectileEntity } from "../entities/Projectile";
import { Weapon } from "./Weapon";

export class PistolWeapon extends Weapon {
    private readonly _size = new Size(10, 4);

    public fireSingleShot(location: Vector, direction: Vector, context: IGameContext, time: FrameTime): void {
        let offset = direction.x > 0 ? new Vector(this._size.width, 0) : new Vector(this._size.width * -1, 0);
        let projectile = new ProjectileEntity(location.add(offset), direction.toUnit().multiplyScalar(600), time, context);
        projectile.power = 2;
        context.entityManager.add(projectile);
    }

    public render(location: Vector, direction: Vector, viewport: Viewport): void {
        viewport.context.fillStyle = "gray";

        if (direction.x > 0) {
            viewport.context.fillRect(location.x, location.y, this._size.width, this._size.height);
        } else {
            viewport.context.fillRect(location.x - this._size.width, location.y, this._size.width, this._size.height);
        }
    }
}