import { execSync } from "child_process";

convert("runner-robot", "StandLeft", "runner_bot_stand_left");
convert("runner-robot", "StandRight", "runner_bot_stand_right");
convert("runner-robot", "WalkLeft", "runner_bot_walk_left");
convert("runner-robot", "WalkRight", "runner_bot_walk_right");
convert("runner-robot", "JumpLeft", "runner_bot_jump_left");
convert("runner-robot", "JumpRight", "runner_bot_jump_right");

function convert(fileName, tag, outputName) {
    let tagSegment = tag ? `--frame-tag ${tag}` : "";

    execSync(`aseprite -b ${tagSegment} assets/${fileName}.aseprite  --sheet public/assets/gfx/${outputName}.png --scale 2`);
}