import { ImageResources } from "./Main";
import { InputProvider } from "./input/InputProvider";
import { Viewport } from "./utilities/Viewport";

export class GameContext {
    public readonly viewport: Viewport;
    public readonly input: InputProvider;
    public readonly images: ImageResources;

    public constructor(viewport: Viewport, input: InputProvider, images: ImageResources) {
        this.viewport = viewport;
        this.input = input;
        this.images = images;
    }
}