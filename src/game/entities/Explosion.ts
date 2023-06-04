import { FrameTime } from "../../utilities/FrameTime";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { createExplosion } from "../ParticleFactory";
import { Entity } from "./Entity";

export class ExplosionEntity extends Entity {
    private _radius = 70;
    private readonly _lifetime = 150;

    public constructor(centerLocation: Vector, time: FrameTime, context: IGameContext) {
        super(centerLocation, new Size(0, 0), context);

        this.centerOn(centerLocation);
        this.setRadius(70);

        createExplosion(context.particleSystem, centerLocation, time);
        context.resources.audio.explosion.play();
        context.viewport.shakeHeavy(time);
    }

    public update(_time: FrameTime) {
        let age = this.age;

        if (age > this._lifetime) {
            this.markDisposable();
            return;
        }

        this.causeDamage();
    }

    private causeDamage() {
        let enemies = this.context.entityManager.getEnemies();
        for (let enemy of enemies) {
            let distance = enemy.location.distanceTo(this.centerLocation);
            if (distance < this._radius) {
                enemy.hit(20, this.centerLocation.subtract(enemy.centerLocation));
            }
        }
    }

    public render(_viewport: Viewport) { }

    private setRadius(radius: number) {
        let centerLocation = this.centerLocation;
        this._radius = radius;
        this.size = new Size(radius * 2, radius * 2);
        this.centerOn(centerLocation);
    }
}