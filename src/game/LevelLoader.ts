import { Color } from "../utilities/Color";
import { Block, ImageBlockScanner } from "../utilities/ImageBlockScanner";
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
        let images = this._game.resources.images.levels[level.name];

        // let collisionImage = this._game.resources.images.levels.level1Collisions;
        // let backdropImage = this._game.resources.images.levels.level1;

        // if (level.backdropImage == "level1") {
        //     backdropImage = this._game.resources.images.levels.level1;
        //     collisionImage = this._game.resources.images.levels.level1Collisions;
        // }
        let blocks = new ImageBlockScanner().loadBlocks(images.metadata);
        let collisionBlocks = this.loadCollisionBlocks(blocks);

        this._game.setLevel(new Level(new Size(640, 480), collisionBlocks), images.backdrop, images.overlay);

        this.loadSpawns(level, blocks);
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

    private loadSpawns(level: LevelDefinition, blocks: Block[]) {
        let rects = blocks.filter(b => b.color.equals(new Color(255, 0, 0, 255))).map(b => b.rectangle);

        for (let spawn of rects) {
            this._game.entityManager.add(new EntitySpawner(spawn.location.toVector(), spawn.size, this._game));
        }
    }

    private loadCollisionBlocks(blocks: Block[]): Rectangle[] {
        return blocks.filter(b => b.color.equals(new Color(255, 0, 110, 255))).map(b => b.rectangle);
    }

    private createGate(definition: GateDefinition, entrance: boolean): Gate {
        return new Gate(definition.location, definition.direction, entrance, this._game);
    }
}