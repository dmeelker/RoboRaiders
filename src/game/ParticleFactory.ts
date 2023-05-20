import { FrameTime } from "../utilities/FrameTime";
import { Color, Emitter, EmitterGroup, IEmitter, NumberRange, ParticleShape, ParticleSystem } from "../utilities/Particles";
import { Vector } from "../utilities/Trig";

export function createExplosion(particleSystem: ParticleSystem, location: Vector, time: FrameTime): IEmitter {
    let emitterGroup = new EmitterGroup(time);
    emitterGroup.timeToLive = 1000;

    // Core blast
    {
        let emitter = new Emitter(location, time, particleSystem);
        emitter.interval = 1100;
        emitter.count = new NumberRange(1, 1);

        emitter.settings.shape = ParticleShape.Circle;
        emitter.settings.fromColor = new Color(255, 255, 158, 255);
        emitter.settings.toColor = new Color(100, 0, 0, 100);

        emitter.settings.minSize = new NumberRange(60, 60);
        emitter.settings.maxSize = new NumberRange(80, 80);
        emitter.settings.timeToLive = new NumberRange(250, 250);

        emitterGroup.add(emitter);
    }

    // Smoke ring
    {
        let emitter = new Emitter(location, time, particleSystem);
        emitter.interval = 100;
        emitter.count = new NumberRange(40, 50);
        emitter.timeToLive = 200;

        emitter.settings.shape = ParticleShape.Square;
        emitter.settings.fromColor = new Color(128, 128, 128, 255);
        emitter.settings.toColor = new Color(50, 50, 50, 0);

        emitter.settings.angle = new NumberRange(0, 360);
        emitter.settings.velocity = new NumberRange(40, 60);
        emitter.settings.gravity = new Vector(0, -60);
        emitter.settings.minSize = new NumberRange(4, 4);
        emitter.settings.minSize = new NumberRange(10, 10);
        emitter.settings.timeToLive = new NumberRange(300, 500);

        emitterGroup.add(emitter);
    }

    // Yellow sparks
    {
        let emitter = new Emitter(location, time, particleSystem);
        emitter.interval = 1100;
        emitter.count = new NumberRange(30, 40);

        emitter.settings.color = new Color(255, 238, 158, 255);
        emitter.settings.angle = new NumberRange(0, 360);
        emitter.settings.velocity = new NumberRange(120, 140);
        emitter.settings.size = 2
        emitter.settings.timeToLive = new NumberRange(300, 500);

        emitterGroup.add(emitter);
    }

    // Red sparks
    {
        let emitter = new Emitter(location, time, particleSystem);
        emitter.interval = 1100;
        emitter.count = new NumberRange(10, 20);

        emitter.settings.color = new Color(150, 0, 0, 255);
        emitter.settings.angle = new NumberRange(0, 360);
        emitter.settings.velocity = new NumberRange(120, 140);
        emitter.settings.size = 2
        emitter.settings.timeToLive = new NumberRange(300, 500);

        emitterGroup.add(emitter);
    }

    // Floating embers
    {
        let emitter = new Emitter(location, time, particleSystem);
        emitter.interval = 1100;
        emitter.count = new NumberRange(5, 10);

        emitter.settings.shape = ParticleShape.Square;
        emitter.settings.timeToLive = new NumberRange(500, 500);
        emitter.settings.gravity = new Vector(0, -100);
        emitter.settings.angle = new NumberRange(0, 360);
        emitter.settings.velocity = new NumberRange(28, 50);
        emitter.settings.minSize = new NumberRange(2, 2);
        emitter.settings.maxSize = new NumberRange(10, 12);
        emitter.settings.fromColor = new Color(255, 0, 0, 255);
        emitter.settings.toColor = new Color(20, 20, 20, 100);

        emitterGroup.add(emitter);
    }

    particleSystem.addEmitter(emitterGroup);
    return emitterGroup;
}

export function createSparkEmitter(particleSystem: ParticleSystem, location: Vector, direction: Vector, time: FrameTime): Emitter {
    let emitter = new Emitter(location, time, particleSystem);
    emitter.interval = 100;
    emitter.timeToLive = 100;
    emitter.count = new NumberRange(10, 20);

    emitter.settings.fromColor = new Color(255, 238, 158, 255);
    emitter.settings.toColor = new Color(150, 0, 0, 255);
    emitter.settings.angle = new NumberRange(direction.angleInDegrees - 12, direction.angleInDegrees + 12);
    emitter.settings.velocity = new NumberRange(150, 200);
    emitter.settings.size = 2
    emitter.settings.timeToLive = new NumberRange(200, 300);
    emitter.settings.gravity = new Vector(0, 100);

    particleSystem.addEmitter(emitter);
    return emitter;
}