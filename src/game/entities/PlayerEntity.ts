import { FrameTime } from "../../utilities/FrameTime";
import { Rectangle, Size, Vector } from "../../utilities/Trig";
import { Viewport } from "../../utilities/Viewport";
import { Entity } from "./Entity";

export class PlayerEntity extends Entity {

    public velocity = Vector.zero;

    public constructor(location: Vector) {
        super(location, new Size(20, 20));
    }

    public update(_time: FrameTime) {
        this.velocity = this.velocity.add(new Vector(0, _time.calculateMovement(500)));

        if (this.velocity.x != 0) {
            let distanceX = _time.calculateMovement(this.velocity.x);
            let newX = this.location.x + distanceX;
            let nextLocation = new Vector(newX, this.location.y);

            if (this.velocity.x > 0) {
                let collision = this.checkCollisions(this.getRightCollisionPoints(nextLocation));
                if (collision) {
                    this.velocity.x = 0;
                    newX = collision.bounds.x - this.width;
                }
            } else if (this.velocity.x < 0) {
                let collision = this.checkCollisions(this.getLeftCollisionPoints(nextLocation));
                if (collision) {
                    this.velocity.x = 0;
                    newX = collision.bounds.x + collision.bounds.width;
                }
            }

            this.location.x = newX;
        }

        if (this.velocity.y != 0) {
            let distanceY = _time.calculateMovement(this.velocity.y);
            let newY = this.location.y + distanceY;
            let nextLocation = new Vector(this.location.x, newY);

            if (this.velocity.y > 0) {
                let collision = this.checkCollisions(this.getBottomCollisionPoints(nextLocation));
                if (collision) {
                    this.velocity.y = 0;
                    newY = collision.bounds.y - this.height;
                }
            } else if (this.velocity.y < 0) {
                let collision = this.checkCollisions(this.getTopCollisionPoints(nextLocation));
                if (collision) {
                    this.velocity.y = 0;
                    newY = collision.bounds.y + collision.bounds.height;
                }
            }

            this.location.y = newY;
        }
    }

    private readonly _collisionGranularity = 7;

    private getTopCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x), Math.floor(location.y - 1)), new Vector(this._collisionGranularity, 0), this.bounds.width);
    }

    private getBottomCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x), Math.floor(location.y + this.bounds.size.height)), new Vector(this._collisionGranularity, 0), this.bounds.width);
    }

    private getLeftCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x - 1), Math.floor(location.y)), new Vector(0, this._collisionGranularity), this.bounds.height);
    }

    private getRightCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x + this.bounds.size.width), Math.floor(location.y)), new Vector(0, this._collisionGranularity), this.bounds.height);
    }

    public jump() {
        this.velocity.y = -300;
        //console.log(this.getBottomCollisionPoints());
    }

    public moveLeft() {
        this.velocity.x = -200;
    }

    public moveRight() {
        this.velocity.x = 200;
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

        return checkRect(new Rectangle(0, 0, 500, 100)) ??
            checkRect(new Rectangle(0, 300, 500, 100)) ??
            checkRect(new Rectangle(0, 0, 100, 500)) ??
            checkRect(new Rectangle(300, 0, 100, 500)) ??
            checkRect(new Rectangle(150, 200, 100, 10)) ??
            checkRect(new Rectangle(100, 250, 50, 10)) ??
            checkRect(new Rectangle(250, 250, 50, 10)) ??
            undefined;
    }

    public render(viewport: Viewport) {
        viewport.context.fillStyle = "gray";
        viewport.context.fillRect(150, 200, 100, 10);
        viewport.context.fillRect(100, 250, 50, 10);
        viewport.context.fillRect(250, 250, 50, 10);

        viewport.context.fillRect(0, 0, 500, 100);
        viewport.context.fillRect(0, 300, 500, 100);
        viewport.context.fillRect(0, 0, 100, 500);
        viewport.context.fillRect(300, 0, 100, 500);

        viewport.context.fillStyle = "green";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);

        this.drawPoints(viewport, this.getTopCollisionPoints(this.location));
        this.drawPoints(viewport, this.getBottomCollisionPoints(this.location));
        this.drawPoints(viewport, this.getLeftCollisionPoints(this.location));
        this.drawPoints(viewport, this.getRightCollisionPoints(this.location));
    }

    private drawPoints(viewport: Viewport, points: Array<Vector>) {
        viewport.context.fillStyle = "blue";

        for (let p of points) {
            viewport.context.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 1);

        }
    }
}

interface CollisionResult {
    bounds: Rectangle
}