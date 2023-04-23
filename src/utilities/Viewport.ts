import { Size } from "./Trig";
import * as Dom from "./Dom";

export class Viewport {
    private readonly _size: Size;
    private readonly _parentElement;
    private _element: HTMLElement;
    private readonly _canvas: HTMLCanvasElement;
    private readonly _canvasContext: CanvasRenderingContext2D;
    private readonly _uiElement: HTMLElement;

    public constructor(size: Size, element: HTMLElement) {
        this._size = size;
        this._parentElement = element;

        this._element = document.createElement("div");
        this._element.style.position = "relative";
        Dom.setSize(this._element, this._size);

        this._canvas = document.createElement("canvas");
        this._canvas.width = size.width;
        this._canvas.height = size.height;
        this._canvas.style.position = "absolute";
        this._canvas.style.inset = "0";
        this._element.appendChild(this._canvas);

        this._canvasContext = this._canvas.getContext("2d")!;

        this._uiElement = document.createElement("div");
        this._uiElement.style.position = "absolute";
        this._uiElement.style.inset = "0";
        this._element.appendChild(this._uiElement);

        this._parentElement.appendChild(this._element);
    }

    public clearCanvas() {
        this._canvasContext.beginPath();
        this._canvasContext.fillStyle = "black";
        this._canvasContext.fillRect(0, 0, this.size.width, this.size.height);
    }

    public get size() { return this._size; }
    public get width() { return this._size.width; }
    public get height() { return this._size.height; }

    public get context() { return this._canvasContext; }
    public get uiElement() { return this._uiElement; }
}