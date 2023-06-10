import { FrameTime } from "../../utilities/FrameTime";
import { Viewport } from "../../utilities/Viewport";
import { Game } from "../Game";
import { GameEvent, IEventSink } from "./Events";


export abstract class GameMode implements IEventSink {
    public readonly game: Game;

    public constructor(game: Game) {
        this.game = game;
    }

    public initializeGame(_time: FrameTime): void { }

    public update(_time: FrameTime): void { }
    public renderLabels(_viewport: Viewport): void { }
    public renderOverlay(_viewport: Viewport): void { }

    public handleEvent(_gameEvent: GameEvent): void { }

    public abstract get highscoreKey(): string;
    public abstract getHighestScore(): number;
}
