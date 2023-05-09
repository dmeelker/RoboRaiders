import { FrameTime } from "../utilities/FrameTime";
import { Rectangle, Size, Vector } from "../utilities/Trig";
import { Level } from "./Level";
import { Entity } from "./entities/Entity";
import { EntityManager } from "./entities/EntityManager";

export enum Axis {
    X,
    Y,
}

type EntityCollisionFilter = (entity: Entity) => boolean;

export interface CollisionResult {
    axis: Axis,
    bounds: Rectangle,
    passable: boolean,
    entity?: Entity
}

export class CollisionContext {
    public constructor(public readonly level: Level, public readonly entities: EntityManager) {
    }
}

export class PhyicalObject {
    public entity: Entity;
    public velocity: Vector = Vector.zero;
    public entityFilter?: EntityCollisionFilter;
    public gravity = true;
    public gravityModifier = 1.0;
    public terminalVelocity = 600;
    private readonly _context: CollisionContext;
    private _onGround = false;
    private _onGroundTime = 0;
    private _lastCollisions = new Array<CollisionResult>();

    public constructor(entity: Entity, velocity: Vector, context: CollisionContext, entityFilter?: EntityCollisionFilter) {
        this.entity = entity;
        this.velocity = velocity;
        this._context = context;
        this.entityFilter = entityFilter;
    }

    public update(time: FrameTime) {
        if (this.gravity) {
            this.velocity = this.velocity.add(new Vector(0, time.calculateMovement(1200 * this.gravityModifier)));
            if (this.velocity.y > this.terminalVelocity) {
                this.velocity.y = this.terminalVelocity;
            }
        }

        this._onGround = false;
        this._lastCollisions = new Array<CollisionResult>();

        if (this.velocity.x != 0) {
            let distanceX = time.calculateMovement(this.velocity.x);
            let newX = this.entity.location.x + distanceX;

            if (this.velocity.x > 0) {
                let steps = this.getPointsToCheck(this.entity.location, new Vector(Math.sign(this.velocity.x) * this._collisionGranularity, 0), distanceX);
                for (let step of steps) {
                    let collision = this.checkCollisions(this.getRightCollisionPoints(step), Axis.X);
                    if (collision) {
                        this._lastCollisions.push(collision);
                        if (!collision.passable) {
                            this.velocity.x = 0;
                            newX = collision.bounds.x - this.width;
                        }
                        break;
                    }
                }
            } else if (this.velocity.x < 0) {
                let steps = this.getPointsToCheck(this.entity.location, new Vector(Math.sign(this.velocity.x) * this._collisionGranularity, 0), distanceX * -1);
                for (let step of steps) {
                    let collision = this.checkCollisions(this.getLeftCollisionPoints(step), Axis.X);
                    if (collision) {
                        this._lastCollisions.push(collision);
                        if (!collision.passable) {
                            this.velocity.x = 0;
                            newX = collision.bounds.x + collision.bounds.width;
                        }
                        break;
                    }
                }
            }

            this.entity.location.x = newX;
        }

        if (this.velocity.y != 0) {
            let distanceY = time.calculateMovement(this.velocity.y);
            let newY = this.entity.location.y + distanceY;

            if (this.velocity.y > 0) {
                let steps = this.getPointsToCheck(this.entity.location, new Vector(0, Math.sign(this.velocity.y) * this._collisionGranularity), distanceY);
                for (let step of steps) {
                    let collision = this.checkCollisions(this.getBottomCollisionPoints(step), Axis.Y,);
                    if (collision) {
                        this._lastCollisions.push(collision);
                        if (!collision.passable) {
                            this.velocity.y = 0;
                            newY = collision.bounds.y - this.height;
                            this._onGround = true;
                            this._onGroundTime = time.currentTime;
                        }
                        break;
                    }
                }
            } else if (this.velocity.y < 0) {
                let steps = this.getPointsToCheck(this.entity.location, new Vector(0, Math.sign(this.velocity.y) * this._collisionGranularity), distanceY * -1);
                for (let step of steps) {
                    let collision = this.checkCollisions(this.getTopCollisionPoints(step), Axis.Y);
                    if (collision) {
                        this._lastCollisions.push(collision);
                        if (!collision.passable) {
                            this.velocity.y = 0;
                            newY = collision.bounds.y + collision.bounds.height;
                        }
                        break;
                    }
                }
            }

            this.entity.location.y = newY;
        }
    }

    private readonly _collisionGranularity = 7;

    private getTopCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x), Math.floor(location.y - 1)), new Vector(this._collisionGranularity, 0), this.width);
    }

    private getBottomCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x), Math.floor(location.y + this.height)), new Vector(this._collisionGranularity, 0), this.width);
    }

    private getLeftCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x - 1), Math.floor(location.y)), new Vector(0, this._collisionGranularity), this.height);
    }

    private getRightCollisionPoints(location: Vector): Array<Vector> {
        return this.getPointsToCheck(new Vector(Math.floor(location.x + this.width), Math.floor(location.y)), new Vector(0, this._collisionGranularity), this.height);
    }

    private checkCollisions(points: Iterable<Vector>, axis: Axis): CollisionResult | undefined {
        for (let point of points) {
            let collision = this.checkCollision(point, axis);
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

    private checkCollision(location: Vector, axis: Axis): CollisionResult | undefined {
        return this.checkLevelCollision(location, axis) ??
            this.checkEntityCollision(location, axis);
    }

    private checkLevelCollision(location: Vector, axis: Axis): CollisionResult | undefined {
        if (!this._context.level.bounds.containsPoint(location)) {

        }

        for (let block of this._context.level.blocks) {
            if (block.containsPoint(location)) {
                return { bounds: block, axis, passable: false };
            }
        }

        return undefined;
    }

    private checkEntityCollision(location: Vector, axis: Axis): CollisionResult | undefined {
        if (this.entityFilter) {
            let entities = this._context.entities.getAtLocation(location);
            for (let entity of entities) {
                if (this.entityFilter(entity) && this.canCollideWith(entity)) {
                    return { bounds: entity.bounds, axis, passable: true, entity };
                }
            }
        }

        return undefined;
    }

    private canCollideWith(entity: Entity): boolean {
        if (entity == this.entity) {
            return false;
        }
        return true;
    }

    public get width() { return this.entity.size.width; }
    public get height() { return this.entity.size.height; }
    public get onGround() { return this._onGround; }
    public get onGroundTime() { return this._onGroundTime; }

    public get lastCollisions() { return this._lastCollisions; }
}