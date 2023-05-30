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
convert("runner-robot", "HitRight", "runner_bot_hit_right");
convert("runner-robot", "HitLeft", "runner_bot_hit_left");

convert("roller-robot", "StandLeft", "roller_bot_stand_left");
convert("roller-robot", "StandRight", "roller_bot_stand_right");
convert("roller-robot", "WalkLeft", "roller_bot_walk_left");
convert("roller-robot", "WalkRight", "roller_bot_walk_right");
convert("roller-robot", "JumpLeft", "roller_bot_jump_left");
convert("roller-robot", "JumpRight", "roller_bot_jump_right");
convert("roller-robot", "HitRight", "roller_bot_hit_right");
convert("roller-robot", "HitLeft", "roller_bot_hit_left");

convert("fast-robot", "StandLeft", "fast_bot_stand_left");
convert("fast-robot", "StandRight", "fast_bot_stand_right");
convert("fast-robot", "WalkLeft", "fast_bot_walk_left");
convert("fast-robot", "WalkRight", "fast_bot_walk_right");
convert("fast-robot", "JumpLeft", "fast_bot_jump_left");
convert("fast-robot", "JumpRight", "fast_bot_jump_right");
convert("fast-robot", "HitRight", "fast_bot_hit_right");
convert("fast-robot", "HitLeft", "fast_bot_hit_left");

convert("crate", null, "crate");

convert("weapons/bullet");
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

convertLevel("level1");
convertLevel("level2");

scale("font", 1, "font_small");
scale("font", 2, "font_default");
scale("font", 3, "font_large");

function convert(fileName, tag, outputName) {
    outputName ??= fileName;
    let tagSegment = tag ? `--frame-tag ${tag}` : "";

    console.log(`Converting ${fileName} [${tag}]`);
    execSync(`aseprite -b ${tagSegment} assets/${fileName}.aseprite  --sheet public/assets/gfx/${outputName}.png --scale 2`);
}

function convertLevel(fileName) {
    fileName = "levels/" + fileName;
    convertBackground(fileName, fileName + "_background");
    extractLayer(fileName, fileName + "_overlay", "Overlay");
    extractLayer(fileName, fileName + "_metadata", "Metadata");
    generateLevelThumbnail(fileName);
}

function extractLayer(fileName, outputName, layer) {
    console.log(`Converting ${fileName} [${layer}]`);
    execSync(`aseprite -b assets/${fileName}.aseprite --layer ${layer} --save-as  public/assets/gfx/${outputName}.png`);
}

function convertBackground(fileName, outputName) {
    console.log(`Converting ${fileName}`);
    execSync(`aseprite -b assets/${fileName}.aseprite --ignore-layer Overlay --ignore-layer Metadata --save-as public/assets/gfx/${outputName}.png`);
}

function generateLevelThumbnail(fileName) {
    let outputName = fileName + "_thumbnail";
    console.log(`Generating ${fileName} [thumbnail]`);
    execSync(`aseprite -b assets/${fileName}.aseprite --ignore-layer Metadata --scale .5 --save-as public/assets/gfx/${outputName}.png`);
}

function scale(fileName, scale, outputName) {
    console.log(`Scaling ${fileName} [${scale}]`);
    execSync(`aseprite -b assets/${fileName}.aseprite --scale ${scale} --save-as public/assets/gfx/${outputName}.png`);
}