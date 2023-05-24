import { Color } from "../utilities/Color";
import { Block, ImageBlockScanner } from "../utilities/ImageBlockScanner";
import { Rectangle, Size } from "../utilities/Trig";
import { Game } from "./Game";
import { GateDefinition, Level, LevelDefinition } from "./Level";
import { EntitySpawner } from "./entities/EntitySpawner";
import { Gate, GateDirection } from "./entities/Gate";

export class LevelLoader {
    private readonly _game: Game;

    public constructor(game: Game) {
        this._game = game;
    }

    public loadLevel(level: LevelDefinition) {
        let images = this._game.resources.images.levels[level.name];

        let blocks = new ImageBlockScanner().loadBlocks(images.metadata);
        let collisionBlocks = this.loadCollisionBlocks(blocks);

        this._game.setLevel(new Level(new Size(640, 480), collisionBlocks), images.backdrop, images.overlay);

        this.loadSpawns(blocks);
        this.loadGates(blocks);
    }

    private loadGates(blocks: Block[]) {
        {
            const entranceColor = new Color(255, 182, 0, 255);
            const exitColor = new Color(255, 255, 0, 255);

            const entrances = blocks.filter(b => b.color.equals(entranceColor));
            const exits = blocks.filter(b => b.color.equals(exitColor));

            if (entrances.length == 1 && exits.length == 1) {
                let entrance = new Gate(entrances[0].rectangle, GateDirection.Right, true, this._game);
                let exit = new Gate(exits[0].rectangle, GateDirection.Left, false, this._game);

                entrance._matchingGate = exit;

                this._game.entityManager.add(entrance);
                this._game.entityManager.add(exit);
            }
        }

        {
            const entranceColor = new Color(255, 72, 0, 255);
            const exitColor = new Color(255, 121, 0, 255);

            const entrances = blocks.filter(b => b.color.equals(entranceColor));
            const exits = blocks.filter(b => b.color.equals(exitColor));

            if (entrances.length == 1 && exits.length == 1) {
                let entrance = new Gate(entrances[0].rectangle, GateDirection.Left, true, this._game);
                let exit = new Gate(exits[0].rectangle, GateDirection.Right, false, this._game);

                entrance._matchingGate = exit;

                this._game.entityManager.add(entrance);
                this._game.entityManager.add(exit);
            }
        }
    }

    private loadSpawns(blocks: Block[]) {
        let rects = blocks.filter(b => b.color.equals(new Color(255, 0, 0, 255))).map(b => b.rectangle);

        for (let spawn of rects) {
            this._game.entityManager.add(new EntitySpawner(spawn.location.toVector(), spawn.size, this._game));
        }
    }

    private loadCollisionBlocks(blocks: Block[]): Rectangle[] {
        return blocks.filter(b => b.color.equals(new Color(255, 0, 110, 255))).map(b => b.rectangle);
    }
}