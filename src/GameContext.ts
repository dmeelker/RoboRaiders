import { AudioResources, ImageResources } from "./Main";
import { InputProvider } from "./input/InputProvider";
import { Viewport } from "./utilities/Viewport";

export class GameContext {
    public readonly viewport: Viewport;
    public readonly input: InputProvider;
    public readonly images: ImageResources;
    public readonly audio: AudioResources;

    public constructor(viewport: Viewport, input: InputProvider, images: ImageResources, audio: AudioResources) {
        this.viewport = viewport;
        this.input = input;
        this.images = images;
        this.audio = audio;
    }
}