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
        if (this.velocity.y != 0) {
            let distanceY = _time.calculateMovement(this.velocity.y);
            let newY = this.location.y + distanceY;

            if (this.velocity.y > 0) {
                //let collision = this.checkCollision(this.centerLocation.addY(distanceY));

                let collision = this.checkCollisions(this.getBottomCollisionPoints());
                if (collision) {
                    this.velocity.y = 0;
                    newY = collision.bounds.y - this.height - 1;
                }
            } else if (this.velocity.y < 0) {
                let collision = this.checkCollision(this.centerLocation.addY(distanceY));
                if (collision) {
                    this.velocity.y = 0;
                    newY = collision.bounds.y + collision.bounds.height - (this.height / 2);
                }
            }

            this.location.y = newY;
        }

        if (this.velocity.x != 0) {
            let distanceX = _time.calculateMovement(this.velocity.x);
            let newX = this.location.x + distanceX;

            if (this.velocity.x > 0) {
                let collision = this.checkCollision(this.centerLocation.addX(distanceX));
                if (collision) {
                    this.velocity.x = 0;
                    newX = collision.bounds.x - (this.width / 2) - 1;
                }
            } else if (this.velocity.x < 0) {
                let collision = this.checkCollision(this.centerLocation.addX(distanceX));
                if (collision) {
                    this.velocity.x = 0;
                    newX = collision.bounds.x + collision.bounds.width - (this.width / 2);
                }
            }

            this.location.x = newX;
        }

        //this.location.x += _time.calculateMovement(this.velocity.x);


        this.velocity = this.velocity.add(new Vector(0, _time.calculateMovement(500)));


    }

    private getBottomCollisionPoints(): Array<Vector> {
        return this.getPointsToCheck(new Vector(this.bounds.x, this.bounds.location.y + this.bounds.size.height - 1), new Vector(10, 0), this.bounds.width);
    }

    public jump() {
        this.velocity.y = -300;
        console.log(this.getBottomCollisionPoints());
    }

    public moveLeft() {
        this.velocity.x = -200;
    }

    public moveRight() {
        this.velocity.x = 200;
    }

    private checkCollisionsAlongLine(start: Vector, step: Vector, length: number): CollisionResult | undefined {
        let points = this.getPointsToCheck(start, step, length);

        for (let point of points) {
            let collision = this.checkCollision(point);
            if (collision) {
                return collision;
            }
        }
        return undefined;
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

        for (let i = 0; i < steps; i++) {
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

        viewport.context.fillStyle = "green";
        viewport.context.fillRect(Math.floor(this.location.x), Math.floor(this.location.y), this.size.width, this.size.height);
    }
}

interface CollisionResult {
    bounds: Rectangle
}