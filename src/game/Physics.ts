import { FrameTime } from "../utilities/FrameTime";
import { Rectangle, Size, Vector } from "../utilities/Trig";

export interface CollisionResult {
    bounds: Rectangle
}

export class PhyicalObject {
    public location: Vector;
    public size: Size;
    public velocity: Vector = Vector.zero;
    public gravity = true;

    public constructor(location: Vector, size: Size, velocity: Vector) {
        this.location = location;
        this.size = size;
        this.velocity = velocity;
    }

    public update(_time: FrameTime) {
        if (this.gravity) {
            this.velocity = this.velocity.add(new Vector(0, _time.calculateMovement(500)));
        }

        if (this.velocity.x != 0) {
            let distanceX = _time.calculateMovement(this.velocity.x);
            let newX = this.location.x + distanceX;

            if (this.velocity.x > 0) {
                let steps = this.getPointsToCheck(this.location, new Vector(Math.sign(this.velocity.x) * this._collisionGranularity, 0), distanceX);
                for (let step of steps) {
                    let collision = this.checkCollisions(this.getRightCollisionPoints(step));
                    if (collision) {
                        this.velocity.x = 0;
                        newX = collision.bounds.x - this.width;
                        break;
                    }
                }
            } else if (this.velocity.x < 0) {
                let steps = this.getPointsToCheck(this.location, new Vector(Math.sign(this.velocity.x) * this._collisionGranularity, 0), distanceX * -1);
                for (let step of steps) {
                    let collision = this.checkCollisions(this.getLeftCollisionPoints(step));
                    if (collision) {
                        this.velocity.x = 0;
                        newX = collision.bounds.x + collision.bounds.width;
                        break;
                    }
                }
            }

            this.location.x = newX;
        }

        if (this.velocity.y != 0) {
            let distanceY = _time.calculateMovement(this.velocity.y);
            let newY = this.location.y + distanceY;

            if (this.velocity.y > 0) {
                let steps = this.getPointsToCheck(this.location, new Vector(0, Math.sign(this.velocity.y) * this._collisionGranularity), distanceY);
                for (let step of steps) {
                    let collision = this.checkCollisions(this.getBottomCollisionPoints(step));
                    if (collision) {
                        this.velocity.y = 0;
                        newY = collision.bounds.y - this.height;
                        break;
                    }
                }
            } else if (this.velocity.y < 0) {
                let steps = this.getPointsToCheck(this.location, new Vector(0, Math.sign(this.velocity.y) * this._collisionGranularity), distanceY * -1);
                for (let step of steps) {
                    let collision = this.checkCollisions(this.getTopCollisionPoints(step));
                    if (collision) {
                        this.velocity.y = 0;
                        newY = collision.bounds.y + collision.bounds.height;
                        break;
                    }
                }
            }

            this.location.y = newY;
        }
    }

    private readonly _collisionGranularity = 7;

    private getTopCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x), Math.floor(location.y - 1)), new Vector(this._collisionGranularity, 0), this.width);
    }

    private getBottomCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x), Math.floor(location.y + this.size.height)), new Vector(this._collisionGranularity, 0), this.width);
    }

    private getLeftCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x - 1), Math.floor(location.y)), new Vector(0, this._collisionGranularity), this.height);
    }

    private getRightCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x + this.size.width), Math.floor(location.y)), new Vector(0, this._collisionGranularity), this.height);
    }

    private checkCollisions(points: Array<Vector>): CollisionResult | undefined {
        for (let point of points) {
            let collision = this.checkCollision(point);
            if (collision) {
                return collision;
            }
        }
        return undefined;
    }

    private getPointsToCheck(start: Vector, step: Vector, length: number): Array<Vector> {
        let location = start;
        let result = new Array<Vector>();
        let steps = Math.floor(length / step.length);

        for (let i = 0; i <= steps; i++) {
            result.push(location);

            location = location.add(step);
        }

        result.push(start.add(step.toUnit().multiplyScalar(length - 1)));
        return result;
    }

    private checkCollision(location: Vector): CollisionResult | undefined {
        let checkRect = (rect: Rectangle) => {
            if (rect.containsPoint(location)) {
                return { bounds: rect };
            } else {
                return undefined;
            }
        };

        return checkRect(new Rectangle(0, 0, 400, 100)) ??
            checkRect(new Rectangle(0, 300, 400, 100)) ??
            checkRect(new Rectangle(0, 0, 100, 400)) ??
            checkRect(new Rectangle(300, 0, 100, 400)) ??
            checkRect(new Rectangle(150, 200, 100, 10)) ??
            checkRect(new Rectangle(100, 250, 50, 10)) ??
            checkRect(new Rectangle(250, 250, 50, 10)) ??
            undefined;
    }

    public get width() { return this.size.width; }
    public get height() { return this.size.height; }
}