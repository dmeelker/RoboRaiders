import { FrameTime } from "./FrameTime";
import { interpolate } from "./Math";
import { Vector } from "./Trig";
import { Viewport } from "./Viewport";

export class Color {
    public constructor(public r: number, public g: number, public b: number, public a: number) {

    }

    public get cssColor(): string {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}

export class ProjectileRange {
    public constructor(public min: number, public max: number) { }
}

export class Projectile {
    private readonly _creationTime: number;
    public location: Vector;
    public velocity: Vector = Vector.zero;
    public gravity: Vector = Vector.zero;

    public size: number = 2;
    public sizeRange: ProjectileRange = new ProjectileRange(2, 2);
    public color: Color;
    public timeToLive = 100;

    public constructor(location: Vector, color: Color, time: FrameTime) {
        this._creationTime = time.currentTime;
        this.location = location;
        this.color = color;
    }

    public update(time: FrameTime): boolean {
        if (this.passedTimeToLive(time)) {
            return false;
        }

        const lifeTimePassed = this.lifeTimePassed(time);
        this.updateSize(lifeTimePassed);

        this.velocity = this.velocity.add(time.scaleVector(this.gravity));
        this.location = this.location.add(time.scaleVector(this.velocity));

        return true;
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = this.color.cssColor;
        viewport.context.fillRect(Math.floor(this.location.x - (this.size / 2)), Math.floor(this.location.y - (this.size / 2)), Math.floor(this.size), Math.floor(this.size));
    }

    public getAge(time: FrameTime) {
        return time.currentTime - this._creationTime;
    }

    private lifeTimePassed(time: FrameTime) {
        return this.getAge(time) / this.timeToLive;
    }

    public passedTimeToLive(time: FrameTime) {
        return this.getAge(time) > this.timeToLive;
    }

    private updateSize(lifeTimePassed: number) {
        this.size = interpolate(this.sizeRange.min, this.sizeRange.max, lifeTimePassed);
    }
}

export class ProjectileSystem {
    private _projectiles: Projectile[] = [];

    public add(projectile: Projectile) {
        this._projectiles.push(projectile);
    }

    public update(time: FrameTime) {
        this._projectiles = this._projectiles.filter(p => p.update(time));
    }

    public render(viewport: Viewport) {
        for (let projectile of this._projectiles) {
            projectile.render(viewport);
        }
    }
}