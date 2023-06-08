import { LevelDefinition } from "./LevelDefinition";
import level1 from "./levels/Level1";
import level2 from "./levels/Level2";
import level3 from "./levels/Level3";
import level4 from "./levels/Level4";

export class LevelSet {
    private readonly _levels: LevelDefinition[];

    public constructor() {
        this._levels = [
            level1,
            level2,
            level3,
            level4,
        ]

        this.load();
        this._levels[0].locked = false;
    }

    public unlockNextLevel(currentLevel: LevelDefinition): boolean {
        let index = this._levels.indexOf(currentLevel);
        let nextLevel = this._levels[index + 1];

        if (nextLevel?.locked) {
            nextLevel.locked = false;
            this.saveUnlockedLevels();
            return true;
        } else {
            return false;
        }
    }

    public load() {
        let unlockedLevelsString = window.localStorage.getItem("unlockedLevels");
        if (!unlockedLevelsString)
            return;

        let unlockedLevels = JSON.parse(unlockedLevelsString);

        for (let level of this._levels) {
            level.locked = unlockedLevels.indexOf(level.code) === -1;
        }
    }

    private saveUnlockedLevels() {
        window.localStorage.setItem("unlockedLevels", JSON.stringify(this._levels.filter(l => !l.locked).map(l => l.code)));
    }

    public get levels() { return this._levels; }
}