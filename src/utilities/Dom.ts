import { Point, Size } from "./Trig";

export function setVisible(element: HTMLElement, visible: boolean) {
    element.style.display = visible ? "block" : "none";
}

export function hide(element: HTMLElement) {
    setVisible(element, false);
}

export function show(element: HTMLElement) {
    setVisible(element, true);
}

export function setSize(element: HTMLElement, size: Size) {
    element.style.width = size.width + "px";
    element.style.height = size.height + "px";
}

export function setLocation(element: HTMLElement, location: Point) {
    element.style.left = location.x + "px";
    element.style.top = location.y + "px";
}

export function position(element: HTMLElement, location: Point) {
    element.style.position = "absolute";
    element.style.left = location.x + "px";
    element.style.top = location.y + "px";
}

export function clear(element: HTMLElement) {
    while (element.lastElementChild) {
        element.removeChild(element.lastElementChild);
    }
}