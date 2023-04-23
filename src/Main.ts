import { hello } from "./test";
import { FrameCounter } from "./utilities/FrameCounter";

function component() {
    const element = document.createElement('div');
    element.innerHTML = hello("piet");

    return element;
}

let counter = new FrameCounter();
counter.frame();
console.log(counter.fps);

document.body.appendChild(component());