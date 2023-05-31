import { AudioClip, AudioSystem } from "./Audio";

export class AudioLoader {
    public readonly basePath: string = "";
    private readonly _audioSystem: AudioSystem;

    public constructor(basePath: string, audioSystem: AudioSystem) {
        this.basePath = basePath;
        this._audioSystem = audioSystem;
    }

    public async load(url: string, instances: number): Promise<AudioClip> {
        let tasks = new Array<Promise<HTMLAudioElement>>();

        for (let i = 0; i < instances; i++) {
            tasks.push(this.loadSingle(url));
        }

        await Promise.all(tasks);

        let elements = new Array<HTMLAudioElement>();
        for (let i = 0; i < instances; i++) {
            elements.push(await tasks[i]);
        }

        return new AudioClip(elements, this._audioSystem);
    }

    private async loadSingle(url: string): Promise<HTMLAudioElement> {
        return new Promise<HTMLAudioElement>((resolve) => {
            url = this.getAudioUrl(url);
            const audio = new Audio();

            const eventHandler = () => {
                console.log(`Loaded ${url}`);
                resolve(audio);
                audio.removeEventListener("canplaythrough", eventHandler);
            };

            audio.addEventListener("canplaythrough", eventHandler);
            audio.src = url;
        });
    }

    private getAudioUrl(url: string): string {
        if (this.basePath) {
            if (this.basePath.endsWith("/")) {
                return this.basePath + url;
            } else {
                return this.basePath + "/" + url;
            }
        } else {
            return url;
        }
    }
}