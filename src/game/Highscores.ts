export class Highscores {
    private _scores: { [id: string]: number } = {};

    public constructor() {
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

    private load() {
        let scoresString = window.localStorage.getItem("highscores");

        if (!scoresString) {
            this._scores = {};
            return;
        }

        this._scores = JSON.parse(scoresString);
    }

    private save() {
        let scoresString = JSON.stringify(this._scores);
        window.localStorage.setItem("highscores", scoresString);
    }
}