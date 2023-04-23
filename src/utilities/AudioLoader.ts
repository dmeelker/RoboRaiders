export class AudioLoader {
    public readonly basePath: string = "";

    public constructor(basePath?: string) {
        this.basePath = basePath ?? "";
    }

    public async load(url: string): Promise<HTMLAudioElement> {
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