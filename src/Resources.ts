import { Font } from "./Font";
import { AnimationDefinition } from "./utilities/Animation";
import { AudioClip } from "./utilities/Audio";
import { AudioLoader } from "./utilities/AudioLoader";
import { ImageLoader } from "./utilities/ImagesLoader";
import { SpriteSheetLoader } from "./utilities/SpriteSheetLoader";

export interface ImageResources {
    background: ImageBitmap;

    crate: ImageBitmap;
    bullet: ImageBitmap;
    pistol: ImageBitmap;
    machinegun: ImageBitmap;
    shotgun: ImageBitmap;
    rpg: ImageBitmap;
    rpgGrenade: ImageBitmap;
    railgun: ImageBitmap;
    railgunLoaded: ImageBitmap;
    dart: ImageBitmap;
    gravityGrenadeUnarmed: ImageBitmap;
    gravityGrenadeArmed: ImageBitmap;

    levels: { [id: string]: LevelImages; };
}

export interface LevelImages {
    backdrop: ImageBitmap;
    overlay: ImageBitmap;
    metadata: ImageBitmap;
    thumbnail: ImageBitmap;
}

export interface AudioResources {
    box: AudioClip;
    explosion: AudioClip;
    hit: AudioClip;
    jump: AudioClip;
    rocket: AudioClip;
    singularitygrenade: AudioClip;
}

interface IAudioFile {
    name: string;
    instances: number;
}

export interface AnimationResources {
    player1StandRight: AnimationDefinition,
    player1WalkRight: AnimationDefinition,
    player1JumpRight: AnimationDefinition,
    player1StandLeft: AnimationDefinition,
    player1WalkLeft: AnimationDefinition,
    player1JumpLeft: AnimationDefinition,

    player2StandRight: AnimationDefinition,
    player2WalkRight: AnimationDefinition,
    player2JumpRight: AnimationDefinition,
    player2StandLeft: AnimationDefinition,
    player2WalkLeft: AnimationDefinition,
    player2JumpLeft: AnimationDefinition,

    runnerBotStandRight: AnimationDefinition,
    runnerBotStandLeft: AnimationDefinition,
    runnerBotWalkRight: AnimationDefinition,
    runnerBotWalkLeft: AnimationDefinition,
    runnerBotJumpRight: AnimationDefinition,
    runnerBotJumpLeft: AnimationDefinition
    runnerBotHitRight: AnimationDefinition,
    runnerBotHitLeft: AnimationDefinition,

    rollerBotStandRight: AnimationDefinition,
    rollerBotStandLeft: AnimationDefinition,
    rollerBotWalkRight: AnimationDefinition,
    rollerBotWalkLeft: AnimationDefinition,
    rollerBotJumpRight: AnimationDefinition,
    rollerBotJumpLeft: AnimationDefinition,
    rollerBotHitRight: AnimationDefinition,
    rollerBotHitLeft: AnimationDefinition,

    fastBotStandRight: AnimationDefinition,
    fastBotStandLeft: AnimationDefinition,
    fastBotWalkRight: AnimationDefinition,
    fastBotWalkLeft: AnimationDefinition,
    fastBotJumpRight: AnimationDefinition,
    fastBotJumpLeft: AnimationDefinition,
    fastBotHitRight: AnimationDefinition,
    fastBotHitLeft: AnimationDefinition,
}

export interface Fonts {
    small: Font;
    default: Font;
    large: Font;
}

export class Resources {
    public constructor(
        public readonly images: ImageResources,
        public readonly audio: AudioResources,
        public readonly animations: AnimationResources,
        public readonly fonts: Fonts) { }
}

export class ResourceLoader {
    public async load(): Promise<Resources> {
        const imageLoader = new ImageLoader("assets/gfx");

        let imageNames = [
            "background.png",
            "crate.png",
            "weapons/bullet.png",
            "weapons/pistol.png",
            "weapons/machinegun.png",
            "weapons/shotgun.png",
            "weapons/rpg.png",
            "weapons/rpg_grenade.png",
            "weapons/railgun.png",
            "weapons/railgun_loaded.png",
            "weapons/dart.png",
            "weapons/gravity_grenade_unarmed.png",
            "weapons/gravity_grenade_armed.png",

            "player1_stand_right.png",
            "player1_walk_right.png",
            "player1_jump_right.png",
            "player1_stand_left.png",
            "player1_walk_left.png",
            "player1_jump_left.png",

            "player2_stand_right.png",
            "player2_walk_right.png",
            "player2_jump_right.png",
            "player2_stand_left.png",
            "player2_walk_left.png",
            "player2_jump_left.png",

            "runner_bot_stand_right.png",
            "runner_bot_stand_left.png",
            "runner_bot_walk_right.png",
            "runner_bot_walk_left.png",
            "runner_bot_jump_right.png",
            "runner_bot_jump_left.png",
            "runner_bot_hit_right.png",
            "runner_bot_hit_left.png",

            "roller_bot_stand_right.png",
            "roller_bot_stand_left.png",
            "roller_bot_walk_right.png",
            "roller_bot_walk_left.png",
            "roller_bot_jump_right.png",
            "roller_bot_jump_left.png",
            "roller_bot_hit_right.png",
            "roller_bot_hit_left.png",

            "fast_bot_stand_right.png",
            "fast_bot_stand_left.png",
            "fast_bot_walk_right.png",
            "fast_bot_walk_left.png",
            "fast_bot_jump_right.png",
            "fast_bot_jump_left.png",
            "fast_bot_hit_right.png",
            "fast_bot_hit_left.png",
        ];

        let imageTasks = new Map<string, Promise<ImageBitmap>>(); //imageNames.map(name => imageLoader.load(name));

        for (let key of imageNames) {
            imageTasks.set(key, imageLoader.load(key));
        }

        await Promise.all(imageTasks.values());

        let images = {
            background: await imageTasks.get("background.png")!,
            crate: await imageTasks.get("crate.png")!,
            bullet: await imageTasks.get("weapons/bullet.png")!,
            pistol: await imageTasks.get("weapons/pistol.png")!,
            machinegun: await imageTasks.get("weapons/machinegun.png")!,
            shotgun: await imageTasks.get("weapons/shotgun.png")!,
            rpg: await imageTasks.get("weapons/rpg.png")!,
            rpgGrenade: await imageTasks.get("weapons/rpg_grenade.png")!,
            railgun: await imageTasks.get("weapons/railgun.png")!,
            railgunLoaded: await imageTasks.get("weapons/railgun_loaded.png")!,
            dart: await imageTasks.get("weapons/dart.png")!,
            gravityGrenadeUnarmed: await imageTasks.get("weapons/gravity_grenade_unarmed.png")!,
            gravityGrenadeArmed: await imageTasks.get("weapons/gravity_grenade_armed.png")!,

            levels: {
                level1: await this.loadLevelImages("level1", imageLoader),
                level2: await this.loadLevelImages("level2", imageLoader),
                level3: await this.loadLevelImages("level3", imageLoader),
            },

            player1StandRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player1_stand_right.png")!), 1, 1),
            player1WalkRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player1_walk_right.png")!), 4, 1),
            player1JumpRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player1_jump_right.png")!), 1, 1),
            player1StandLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player1_stand_left.png")!), 1, 1),
            player1WalkLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player1_walk_left.png")!), 4, 1),
            player1JumpLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player1_jump_left.png")!), 1, 1),

            player2StandRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player2_stand_right.png")!), 1, 1),
            player2WalkRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player2_walk_right.png")!), 4, 1),
            player2JumpRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player2_jump_right.png")!), 1, 1),
            player2StandLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player2_stand_left.png")!), 1, 1),
            player2WalkLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player2_walk_left.png")!), 4, 1),
            player2JumpLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("player2_jump_left.png")!), 1, 1),

            runnerBotStandRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("runner_bot_stand_right.png")!), 1, 1),
            runnerBotStandLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("runner_bot_stand_left.png")!), 1, 1),
            runnerBotWalkRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("runner_bot_walk_right.png")!), 4, 1),
            runnerBotWalkLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("runner_bot_walk_left.png")!), 4, 1),
            runnerBotJumpRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("runner_bot_jump_right.png")!), 1, 1),
            runnerBotJumpLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("runner_bot_jump_left.png")!), 1, 1),
            runnerBotHitRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("runner_bot_hit_right.png")!), 1, 1),
            runnerBotHitLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("runner_bot_hit_left.png")!), 1, 1),

            rollerBotStandRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("roller_bot_stand_right.png")!), 1, 1),
            rollerBotStandLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("roller_bot_stand_left.png")!), 1, 1),
            rollerBotWalkRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("roller_bot_walk_right.png")!), 2, 1),
            rollerBotWalkLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("roller_bot_walk_left.png")!), 2, 1),
            rollerBotJumpRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("roller_bot_jump_right.png")!), 1, 1),
            rollerBotJumpLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("roller_bot_jump_left.png")!), 1, 1),
            rollerBotHitRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("roller_bot_hit_right.png")!), 1, 1),
            rollerBotHitLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("roller_bot_hit_left.png")!), 1, 1),

            fastBotStandRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("fast_bot_stand_right.png")!), 1, 1),
            fastBotStandLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("fast_bot_stand_left.png")!), 1, 1),
            fastBotWalkRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("fast_bot_walk_right.png")!), 3, 1),
            fastBotWalkLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("fast_bot_walk_left.png")!), 3, 1),
            fastBotJumpRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("fast_bot_jump_right.png")!), 1, 1),
            fastBotJumpLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("fast_bot_jump_left.png")!), 1, 1),
            fastBotHitRight: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("fast_bot_hit_right.png")!), 1, 1),
            fastBotHitLeft: await new SpriteSheetLoader().cutSpriteSheet((await imageTasks.get("fast_bot_hit_left.png")!), 1, 1),
        };

        let audio = await this.loadAudioResources();

        let animations = {
            player1StandRight: new AnimationDefinition(images.player1StandRight, 1),
            player1WalkRight: new AnimationDefinition(images.player1WalkRight, 150),
            player1JumpRight: new AnimationDefinition(images.player1JumpRight, 1),
            player1StandLeft: new AnimationDefinition(images.player1StandLeft, 1),
            player1WalkLeft: new AnimationDefinition(images.player1WalkLeft, 150),
            player1JumpLeft: new AnimationDefinition(images.player1JumpLeft, 1),

            player2StandRight: new AnimationDefinition(images.player2StandRight, 1),
            player2WalkRight: new AnimationDefinition(images.player2WalkRight, 150),
            player2JumpRight: new AnimationDefinition(images.player2JumpRight, 1),
            player2StandLeft: new AnimationDefinition(images.player2StandLeft, 1),
            player2WalkLeft: new AnimationDefinition(images.player2WalkLeft, 150),
            player2JumpLeft: new AnimationDefinition(images.player2JumpLeft, 1),

            runnerBotStandRight: new AnimationDefinition(images.runnerBotStandRight, 1),
            runnerBotStandLeft: new AnimationDefinition(images.runnerBotStandLeft, 1),
            runnerBotWalkRight: new AnimationDefinition(images.runnerBotWalkRight, 150),
            runnerBotWalkLeft: new AnimationDefinition(images.runnerBotWalkLeft, 150),
            runnerBotJumpRight: new AnimationDefinition(images.runnerBotJumpRight, 1),
            runnerBotJumpLeft: new AnimationDefinition(images.runnerBotJumpLeft, 1),
            runnerBotHitRight: new AnimationDefinition(images.runnerBotHitRight, 1),
            runnerBotHitLeft: new AnimationDefinition(images.runnerBotHitLeft, 1),

            rollerBotStandRight: new AnimationDefinition(images.rollerBotStandRight, 1),
            rollerBotStandLeft: new AnimationDefinition(images.rollerBotStandLeft, 1),
            rollerBotWalkRight: new AnimationDefinition(images.rollerBotWalkRight, 150),
            rollerBotWalkLeft: new AnimationDefinition(images.rollerBotWalkLeft, 150),
            rollerBotJumpRight: new AnimationDefinition(images.rollerBotJumpRight, 1),
            rollerBotJumpLeft: new AnimationDefinition(images.rollerBotJumpLeft, 1),
            rollerBotHitRight: new AnimationDefinition(images.rollerBotHitRight, 1),
            rollerBotHitLeft: new AnimationDefinition(images.rollerBotHitLeft, 1),

            fastBotStandRight: new AnimationDefinition(images.fastBotStandRight, 1),
            fastBotStandLeft: new AnimationDefinition(images.fastBotStandLeft, 1),
            fastBotWalkRight: new AnimationDefinition(images.fastBotWalkRight, 180),
            fastBotWalkLeft: new AnimationDefinition(images.fastBotWalkLeft, 180),
            fastBotJumpRight: new AnimationDefinition(images.fastBotJumpRight, 1),
            fastBotJumpLeft: new AnimationDefinition(images.fastBotJumpLeft, 1),
            fastBotHitRight: new AnimationDefinition(images.fastBotHitRight, 1),
            fastBotHitLeft: new AnimationDefinition(images.fastBotHitLeft, 1),
        };

        let fonts = {
            small: new Font(await imageLoader.load("font_small.png"), 1),
            default: new Font(await imageLoader.load("font_default.png"), 2),
            large: new Font(await imageLoader.load("font_large.png"), 3),
        };

        return new Resources(images, audio, animations, fonts);
    }

    private async loadLevelImages(name: string, imageLoader: ImageLoader): Promise<LevelImages> {
        return {
            backdrop: await imageLoader.load(`levels/${name}_background.png`),
            overlay: await imageLoader.load(`levels/${name}_overlay.png`),
            metadata: await imageLoader.load(`levels/${name}_metadata.png`),
            thumbnail: await imageLoader.load(`levels/${name}_thumbnail.png`),
        }
    }

    private async loadAudioResources(): Promise<AudioResources> {
        const loader = new AudioLoader("assets/sounds");

        let files = await this.loadFiles([
            { name: "box.wav", instances: 1 },
            { name: "explosion.wav", instances: 3 },
            { name: "hit.wav", instances: 10 },
            { name: "jump.wav", instances: 2 },
            { name: "rocket.wav", instances: 3 },
            { name: "singularitygrenade.wav", instances: 3 },
        ], file => loader.load(file.name, file.instances));

        return {
            box: files.get("box.wav")!,
            explosion: files.get("explosion.wav")!,
            hit: files.get("hit.wav")!,
            jump: files.get("jump.wav")!,
            rocket: files.get("rocket.wav")!,
            singularitygrenade: files.get("singularitygrenade.wav")!,
        };
    }

    private async loadFiles<TResource>(files: IAudioFile[], loader: (file: IAudioFile) => Promise<TResource>): Promise<Map<string, TResource>> {
        let tasks = new Map<string, Promise<TResource>>();
        for (let file of files) {
            tasks.set(file.name, loader(file));
        }
        await Promise.all(tasks.values());

        let result = new Map<string, TResource>();
        for (let [key, value] of tasks) {
            result.set(key, await value);
        }

        return result;
    }
}