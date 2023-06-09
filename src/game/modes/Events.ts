import { FrameTime } from "../../utilities/FrameTime";
import { PlayerEntity } from "../entities/PlayerEntity";

export interface IEventSink {
    handleEvent(gameEvent: GameEvent): void;
}

export abstract class GameEvent {
    public readonly type: string;
    public readonly time: number;

    public constructor(type: string, time: FrameTime) {
        this.type = type;
        this.time = time.currentTime;
    }
}

export class BoxCollectedEvent extends GameEvent {
    public static readonly type = "boxCollected";
    public constructor(public player: PlayerEntity, time: FrameTime) {
        super(BoxCollectedEvent.type, time);
    }
}

export class PlayerDiedEvent extends GameEvent {
    public static readonly type = "playerDied";
    public constructor(public player: PlayerEntity, time: FrameTime) {
        super(PlayerDiedEvent.type, time);
    }
}