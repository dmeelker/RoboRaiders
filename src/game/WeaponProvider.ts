import { randomArrayElement } from "../utilities/Random";
import { IGameContext } from "./Game";
import { PlayerEntity } from "./entities/PlayerEntity";
import { BatWeapon } from "./weapons/Bat";
import { ChainsawChain } from "./weapons/ChainsawChain";
import { GoopGunWeapon } from "./weapons/GoopGun";
import { GravityGrenadeWeapon } from "./weapons/GravityGrenadeLauncher";
import { GrenadeLauncherWeapon } from "./weapons/GrenadeLauncher";
import { MachineGunWeapon } from "./weapons/MachineGun";
import { PistolWeapon } from "./weapons/Pistol";
import { RailgunWeapon } from "./weapons/Railgun";
import { RpgWeapon } from "./weapons/Rpg";
import { ShotgunWeapon } from "./weapons/Shotgun";
import { Weapon } from "./weapons/Weapon";

export type WeaponFactory = (player: PlayerEntity) => Weapon;

export class WeaponProvider {
    private _unlockableWeapons: Array<WeaponFactory>;
    private _availableWeapons: Array<WeaponFactory>;
    private _recentWeapons = new Array<Weapon>();

    public constructor(gameContext: IGameContext) {
        this._availableWeapons = [
            (player) => new BatWeapon(player, gameContext),
            (player) => new PistolWeapon(player, gameContext),
            (player) => new ShotgunWeapon(player, gameContext)
        ];

        // These are unlocked in reverse order
        this._unlockableWeapons = [
            (player) => new GoopGunWeapon(player, gameContext),
            (player) => new GrenadeLauncherWeapon(player, gameContext),
            (player) => new RailgunWeapon(player, gameContext),
            (player) => new GravityGrenadeWeapon(player, gameContext),
            (player) => new ChainsawChain(player, gameContext),
            (player) => new RpgWeapon(player, gameContext),
            (player) => new MachineGunWeapon(player, gameContext),
        ];
    }

    public getRandomWeapon(player: PlayerEntity): Weapon {
        let newWeapon: Weapon;

        do {
            newWeapon = randomArrayElement(this._availableWeapons)(player);
        } while (this.recentlyUsedWeapon(newWeapon.name));

        this.addRecentWeapon(newWeapon);

        return newWeapon;
    }

    public unlockWeapon(player: PlayerEntity): Weapon {
        let weaponFactory = this._unlockableWeapons.pop();
        if (weaponFactory) {
            this._availableWeapons.push(weaponFactory);
            let weapon = weaponFactory(player);
            this.addRecentWeapon(weapon);
            return weapon;
        }

        throw new Error("No more weapons to unlock");
    }

    private addRecentWeapon(weapon: Weapon) {
        this._recentWeapons.push(weapon);

        if (this._recentWeapons.length > this.maxRecentWeapons) {
            this._recentWeapons.shift();
        }

        console.log(this._recentWeapons.map(w => w.name).join(", "));
    }

    private recentlyUsedWeapon(name: string): boolean {
        return this._recentWeapons.filter(w => w.name == name).length > 0;
    }

    private get maxRecentWeapons() { return Math.max(Math.floor(this._availableWeapons.length / 2), 2); }
    public get unlockableWeaponsLeft() { return this._unlockableWeapons.length > 0; }
}