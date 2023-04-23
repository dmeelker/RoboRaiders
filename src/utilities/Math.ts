export function interpolate(min: number, max: number, value: number) {
    return min + ((max - min) * value);
}