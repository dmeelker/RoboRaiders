export class Highscores {
    private _key: string;
    private _scores: { [id: string]: number } = {};

    public constructor(key: string) {
        this._key = key;
        this.load();
    }

    public get(levelName: string): number | undefined {
        return this._scores[levelName];
    }

    public update(levelName: string, score: number) {
        let originalScore = this._scores[levelName];

        if (originalScore && originalScore > score)
            return;

        this._scores[levelName] = score;
        this.save();
    }

    public load() {
        let scoresString = window.localStorage.getItem(this.storageKey);

        if (!scoresString) {
            this._scores = {};
            return;
        }

        this._scores = JSON.parse(scoresString);
    }

    private save() {
        let scoresString = JSON.stringify(this._scores);
        window.localStorage.setItem(this.storageKey, scoresString);
    }

    private get storageKey() { return "highscores." + this._key; }
}