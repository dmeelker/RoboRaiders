import { FrameTime } from "./FrameTime";

class AudioClipSource {
    private readonly _audioSystem: AudioSystem;
    public readonly audio: HTMLAudioElement;
    private _canPlay = true;

    public constructor(audio: HTMLAudioElement, audioSystem: AudioSystem, public index: number) {
        this._audioSystem = audioSystem;
        this.audio = audio;
    }

    public play() {
        this._canPlay = false;
        this.audio.volume = this._audioSystem.effectVolume;
        this.audio.play();
        this.audio.addEventListener("ended", () => this._canPlay = true)
    }

    public get canPlay() { return this._canPlay; }
}

export class AudioClip {
    private readonly _audioSystem: AudioSystem;
    private readonly _sources: AudioClipSource[];

    public constructor(sources: HTMLAudioElement[], audioSystem: AudioSystem) {
        this._sources = sources.map((source, index) => new AudioClipSource(source, audioSystem, index));
        this._audioSystem = audioSystem;
    }

    public play() {
        if (this._audioSystem.effectsMuted)
            return;

        const source = this._sources.find(source => source.canPlay);
        if (source) {
            source.play();
        }
    }
}

export class AudioSystem {
    public effectVolume = 1;
    public effectsMuted = false;
}