import { FrameTime } from "./FrameTime";

class AudioClipSource {
    public readonly audio: HTMLAudioElement;
    private _lastPlayTime = -1000;

    public constructor(audio: HTMLAudioElement) {
        this.audio = audio;
    }

    public canPlay(time: FrameTime): boolean {
        return time.currentTime - this._lastPlayTime > this.audio.duration * 1000;
    }

    public play(time: FrameTime) {
        this._lastPlayTime = time.currentTime;
        this.audio.play();
    }
}

export class AudioClip {
    private readonly _sources: AudioClipSource[];

    public constructor(sources: HTMLAudioElement[]) {
        this._sources = sources.map(source => new AudioClipSource(source));
    }

    public play(time: FrameTime) {
        const source = this._sources.find(source => source.canPlay(time));
        if (source) {
            source.play(time);
        }
    }
}