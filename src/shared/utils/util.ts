import { Account } from "../models/account.model";

export abstract class Util {
    static cookieName: string = 'wuteringcalculator-lang';
    // static characters: Array<Character> = new Array<Character>();

    static load(name?: string) {
        return JSON.parse(window.localStorage.getItem(name ? name : this.cookieName));
    }

    static save(object: any, name?: string) {
        window.localStorage.setItem((name ? name : this.cookieName), JSON.stringify(object));
    }

    static clear() {
        window.localStorage.clear();
        window.location.reload();
    }

    static calculate(account: Account): Account {
        //6000XP Items
        const mastered6000: number = account.warframes.filter(w => w.mastered).length
            + account.archwings.filter(a => a.mastered).length
            + account.plexus.filter(p => p.mastered).length
            + account.kdrives.filter(k => k.mastered).length;

        //Intrinsics
        const intrinsics: number = account.railjack + account.drifter;

        account.xp = (1500 * intrinsics) + (6000 * mastered6000);
        account.mastered = mastered6000;
        return account;
    }
}