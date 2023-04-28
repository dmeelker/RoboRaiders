import { Rectangle, Size, Vector } from "./Trig";

export function randomInt(min: number, max: number): number {
    return Math.floor(min + (Math.random() * (max - min)));
}

export function randomArrayIndex<T>(array: Array<T>): number {
    return randomInt(0, array.length);
}

export function randomArrayElement<T>(array: Array<T>): T {
    return array[randomArrayIndex(array)];
}

export function chance(value: number): boolean {
    return randomInt(0, 100) <= value;
}

export function randomLocation(area: Rectangle, size: Size): Vector {
    return new Vector(area.x + randomInt(0, area.width - size.width), area.y + randomInt(0, area.height - size.height));
}