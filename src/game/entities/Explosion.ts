import { FrameTime } from "../../utilities/FrameTime";
import { interpolate } from "../../utilities/Math";
import { Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { IGameContext } from "../Game";
import { createExplosion } from "../ParticleFactory";
import { EnemyEntity } from "./Enemy";
import { Entity } from "./Entity";

export class ExplosionEntity extends Entity {
    private readonly _creationTime: number;
    private _radius = 70;
    private readonly _lifetime = 150;

    public constructor(centerLocation: Vector, time: FrameTime, context: IGameContext) {
        super(centerLocation, new Size(0, 0), context);

        this._creationTime = time.currentTime;
        this.centerOn(centerLocation);
        this.setRadius(70);

        createExplosion(context.particleSystem, centerLocation, time);
    }

    public update(_time: FrameTime) {
        let age = this.age;

        if (age > this._lifetime) {
            this.markDisposable();
            return;
        }

        //let radius = interpolate(1, 70, age / this._lifetime);
        //this.setRadius(this._radius);
        this.causeDamage();
    }

    private causeDamage() {
        let enemies = this.context.entityManager.getOfType(EnemyEntity);
        for (let enemy of enemies) {
            let distance = enemy.location.distanceTo(this.centerLocation);
            if (distance < this._radius) {
                enemy.hit(20);
            }
        }
    }

    public render(viewport: Viewport) {
        // viewport.context.fillStyle = "red";

        // viewport.context.beginPath();
        // viewport.context.arc(Math.floor(this.centerLocation.x), Math.floor(this.centerLocation.y), this._radius, 0, 2 * Math.PI);
        // viewport.context.fill();
    }

    private setRadius(radius: number) {
        let centerLocation = this.centerLocation;
        this._radius = radius;
        this.size = new Size(radius * 2, radius * 2);
        this.centerOn(centerLocation);
    }

    private get age() { return this.context.time.currentTime - this._creationTime; }
}