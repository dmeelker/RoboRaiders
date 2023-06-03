import { Color } from "../utilities/Color";
import { Block, ImageBlockScanner } from "../utilities/ImageBlockScanner";
import * as Trig from "../utilities/Trig";
import { Game } from "./Game";
import { Level } from "./Level";
import { GateSetDefinition, IEnemySpawnDefinition, LevelDefinition } from "./LevelDefinition";
import { EnemySpawner } from "./entities/EnemySpawner";
import { Gate } from "./entities/Gate";
import { PlayerZoneKillerEntity } from "./entities/PlayerKillerZone";

export class LevelLoader {
    private readonly _game: Game;

    public constructor(game: Game) {
        this._game = game;
    }

    public loadLevel(levelDefinition: LevelDefinition) {
        let images = this._game.resources.images.levels[levelDefinition.code];

        let blocks = new ImageBlockScanner().loadBlocks(images.metadata);
        let collisionBlocks = this.loadCollisionBlocks(blocks);
        let playerSpawns = this.loadPlayerSpawnLocations(blocks);


        this._game.setLevel(
            new Level(levelDefinition, new Trig.Size(640, 480), collisionBlocks, playerSpawns),
            images.backdrop,
            images.overlay);

        this.loadSpawns(levelDefinition.spawns);
        this.loadGates(levelDefinition.gates);
        this.loadKillZones(levelDefinition.killZones);
    }

    private loadGates(gates: GateSetDefinition[]) {
        for (let gate of gates) {
            let entrance = new Gate(gate.entrance.rect, gate.entrance.direction, true, this._game);
            let exit = new Gate(gate.exit.rect, gate.exit.direction, false, this._game);
            entrance._matchingGate = exit;

            this._game.entityManager.add(entrance);
            this._game.entityManager.add(exit);
        }
    }

    private loadSpawns(definitions: IEnemySpawnDefinition[]) {
        for (let spawn of definitions) {
            this._game.entityManager.add(new EnemySpawner(spawn.rect.location.toVector(), spawn.rect.size, this._game, spawn.configuration));
        }
    }

    private loadCollisionBlocks(blocks: Block[]): Trig.Rectangle[] {
        return blocks.filter(b => b.color.equals(new Color(255, 0, 110, 255))).map(b => b.rectangle);
    }

    private loadPlayerSpawnLocations(blocks: Block[]): Trig.Vector[] {
        let player1Location = this.getSingleBlock(new Color(0, 62, 255, 255), blocks);
        let player2Location = this.getSingleBlock(new Color(0, 118, 255, 255), blocks);

        let locations = new Array<Trig.Vector>();
        if (player1Location) locations.push(player1Location.rectangle.location.toVector());
        if (player2Location) locations.push(player2Location.rectangle.location.toVector());

        return locations;
    }

    private getSingleBlock(color: Color, blocks: Block[]): Block | null {
        let matches = blocks.filter(b => b.color.equals(color));

        if (matches.length == 1) {
            return matches[0];
        }

        return null;
    }

    private loadKillZones(killZones: Trig.Rectangle[]) {
        for (let killZone of killZones) {
            this._game.entityManager.add(new PlayerZoneKillerEntity(killZone.location.toVector(), killZone.size, this._game));
        }
    }
}