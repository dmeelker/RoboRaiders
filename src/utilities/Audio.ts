import { FrameTime } from "./FrameTime";

class AudioClipSource {
    private readonly _audioSystem: AudioSystem;
    public readonly audio: HTMLAudioElement;
    private _lastPlayTime = -1000;

    public constructor(audio: HTMLAudioElement, audioSystem: AudioSystem) {
        this._audioSystem = audioSystem;
        this.audio = audio;
    }

    public canPlay(time: FrameTime): boolean {
        return time.currentTime - this._lastPlayTime > this.audio.duration * 1000;
    }

    public play(time: FrameTime) {
        this._lastPlayTime = time.currentTime;
        this.audio.volume = this._audioSystem.effectVolume;
        this.audio.play();
    }
}

export class AudioClip {
    private readonly _audioSystem: AudioSystem;
    private readonly _sources: AudioClipSource[];

    public constructor(sources: HTMLAudioElement[], audioSystem: AudioSystem) {
        this._sources = sources.map(source => new AudioClipSource(source, audioSystem));
        this._audioSystem = audioSystem;
    }

    public play(time: FrameTime) {
        if (this._audioSystem.effectsMuted)
            return;

        const source = this._sources.find(source => source.canPlay(time));
        if (source) {
            source.play(time);
        }
    }
}

export class AudioSystem {
    public effectVolume = 1;
    public effectsMuted = false;
}