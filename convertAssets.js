import { execSync } from "child_process";

convert("player1", "StandLeft", "player1_stand_left");
convert("player1", "StandRight", "player1_stand_right");
convert("player1", "WalkLeft", "player1_walk_left");
convert("player1", "WalkRight", "player1_walk_right");
convert("player1", "JumpLeft", "player1_jump_left");
convert("player1", "JumpRight", "player1_jump_right");

convert("player2", "StandLeft", "player2_stand_left");
convert("player2", "StandRight", "player2_stand_right");
convert("player2", "WalkLeft", "player2_walk_left");
convert("player2", "WalkRight", "player2_walk_right");
convert("player2", "JumpLeft", "player2_jump_left");
convert("player2", "JumpRight", "player2_jump_right");

convert("runner-robot", "StandLeft", "runner_bot_stand_left");
convert("runner-robot", "StandRight", "runner_bot_stand_right");
convert("runner-robot", "WalkLeft", "runner_bot_walk_left");
convert("runner-robot", "WalkRight", "runner_bot_walk_right");
convert("runner-robot", "JumpLeft", "runner_bot_jump_left");
convert("runner-robot", "JumpRight", "runner_bot_jump_right");

convert("crate", null, "crate");

convert("weapons/pistol");
convert("weapons/machinegun");
convert("weapons/shotgun");
convert("weapons/rpg");
convert("weapons/rpg_grenade");

convert("weapons/railgun");
convert("weapons/railgun_loaded");
convert("weapons/dart");

convert("weapons/gravity_grenade", "Unarmed", "weapons/gravity_grenade_unarmed");
convert("weapons/gravity_grenade", "Armed", "weapons/gravity_grenade_armed");

function convert(fileName, tag, outputName) {
    outputName ??= fileName;
    let tagSegment = tag ? `--frame-tag ${tag}` : "";

    console.log(`Converting ${fileName} [${tag}]`);
    execSync(`aseprite -b ${tagSegment} assets/${fileName}.aseprite  --sheet public/assets/gfx/${outputName}.png --scale 2`);
}