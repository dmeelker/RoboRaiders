import { ImageBlockScanner } from "../utilities/ImageBlockScanner";
import { Rectangle, Size } from "../utilities/Trig";
import { Game } from "./Game";
import { GateDefinition, Level, LevelDefinition } from "./Level";
import { EntitySpawner } from "./entities/EntitySpawner";
import { Gate } from "./entities/Gate";

export class LevelLoader {
    private readonly _game: Game;

    public constructor(game: Game) {
        this._game = game;
    }

    public loadLevel(level: LevelDefinition) {
        let collisionImage = this._game.resources.images.levels.level1Collisions;
        let backdropImage = this._game.resources.images.levels.level1;

        if (level.backdropImage == "level1") {
            backdropImage = this._game.resources.images.levels.level1;
            collisionImage = this._game.resources.images.levels.level1Collisions;
        }

        let blocks = this.loadBlocks(collisionImage);
        this._game.setLevel(new Level(new Size(640, 480), blocks), backdropImage);

        this.loadSpawns(level);
        this.loadGates(level);
    }

    private loadGates(level: LevelDefinition) {
        for (let g of level.gates) {
            let entrance = this.createGate(g.entrance, true);
            let exit = this.createGate(g.exit, false);

            entrance._matchingGate = exit;

            this._game.entityManager.add(entrance);
            this._game.entityManager.add(exit);
        }
    }

    private loadSpawns(level: LevelDefinition) {
        for (let spawn of level.spawns) {
            this._game.entityManager.add(new EntitySpawner(spawn.location, spawn.size, this._game));
        }
    }

    private loadBlocks(image: ImageBitmap): Rectangle[] {
        let blocks = new ImageBlockScanner().loadBlocks(image);
        return blocks.map(b => b.rectangle);
    }

    private createGate(definition: GateDefinition, entrance: boolean): Gate {
        return new Gate(definition.location, definition.direction, entrance, this._game);
    }
}