export interface ISettings {
    games?: string[];
}

export class Config {

    constructor(private _settings: ISettings = {}) {
    }

    async load() {
        try {
            const response = await fetch("env.json");
            const config = await response.json();

            this._settings = config;
        } catch (error) {
            console.info("No config file found, using defaults");
        }

        return this;
    }

    public get<T>(key: keyof ISettings): T {
        return this._settings[key] as T;
    }

    public print() {
        console.log(this._settings);
    }
}