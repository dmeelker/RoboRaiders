import { randomArrayElement, randomInt } from "../utilities/Random";
import { Rectangle, Vector } from "../utilities/Trig";
import { IGameContext } from "./Game";
import { PlayerEntity } from "./entities/PlayerEntity";
import { BoxEntity } from "./entities/BoxEntity";

export class BoxSpawner {
    private readonly _context: IGameContext;

    public constructor(context: IGameContext) {
        this._context = context;
    }

    public spawn(): BoxEntity {
        let location = this.getRandomValidLocation();
        let box = new BoxEntity(location, this._context);
        this._context.entityManager.add(box);
        return box;
    }

    private getRandomValidLocation(): Vector {
        let location: Vector;

        do {
            location = this.getRandomLocation();
        } while (!this.isValidBoxLocation(location))

        return location;
    }

    private getRandomLocation(): Vector {
        let area = randomArrayElement(this._context.level.itemSpawnAreas);
        let x = randomInt(0, area.width - BoxEntity.size.height);

        return new Vector(area.x + x, area.y + area.height - BoxEntity.size.height);
    }

    private isValidBoxLocation(location: Vector): boolean {
        let boxRect = new Rectangle(location.x, location.y, BoxEntity.size.width, BoxEntity.size.height);

        if (this._context.level.blocks.filter(b => b.overlaps(boxRect)).length > 0) {
            return false;
        }

        for (let player of this._context.entityManager.getOfType(PlayerEntity)) {
            let distance = player.centerLocation.distanceTo(boxRect.center);
            if (distance < 100) {
                return false;
            }
        }

        return true;
    }
}