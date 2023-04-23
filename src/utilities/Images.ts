export class Images {
    private readonly _images = new Map<string, ImageBitmap>();
    public basePath: string = "";

    public constructor(basePath?: string) {
        this.basePath = basePath ?? "";
    }

    public async load(code: string, url: string): Promise<ImageBitmap> {
        const image = await this.loadImage(this.getImageUrl(url));

        this.add(code, image);
        return image;
    }

    private getImageUrl(url: string): string {
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

    private loadImage(url: string): Promise<ImageBitmap> {
        return new Promise<ImageBitmap>((resolve) => {
            let image = new Image();
            image.addEventListener('load', async () => {
                console.log('Loaded ' + url);
                resolve(await window.createImageBitmap(image));
            }, false);

            image.src = url;
        });
    }

    public get(code: string): ImageBitmap {
        return this._images.get(code)!;
    }

    public add(code: string, image: ImageBitmap) {
        this._images.set(code, image);
    }
}