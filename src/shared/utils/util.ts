import { Account } from "../models/account.model";

export abstract class Util {
    static cookieName: string = 'wuteringcalculator-lang';

    static itemTypes: string[] = [
        'plexus',
        'necramechs',
        'hounds',
        'vulpaphylas',
        'predasites',
        'moas',
        'kavats',
        'archwings',
        'kdrives',
        'kubrows',
        'kitguns',
        'archwing_melee',
        'amps',
        'zaws',
        'sentinels',
        'companion_weapon',
        'archwing_primary',
        'warframes',
        'pistols',
        'rifles',
        'melees'];



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
        //3000XP Items
        const mastered3000: number = account.companion_weapon.filter(cw => cw.mastered).length
            + account.amps.filter(a => a.mastered).length
            + account.zaws.filter(z => z.mastered).length
            + account.kitguns.filter(k => k.mastered).length
            + account.archwing_melee.filter(am => am.mastered).length
            + account.archwing_primary.filter(ap => ap.mastered).length
            + account.melees.filter(m => m.mastered).length
            + account.pistols.filter(p => p.mastered).length
            + account.rifles.filter(r => r.mastered).length;

        //6000XP Items
        const mastered6000: number = account.warframes.filter(w => w.mastered).length
            + account.archwings.filter(a => a.mastered).length
            + account.plexus.filter(p => p.mastered).length
            + account.kdrives.filter(k => k.mastered).length
            + account.hounds.filter(h => h.mastered).length
            + account.moas.filter(m => m.mastered).length
            + account.sentinels.filter(s => s.mastered).length
            + account.kubrows.filter(k => k.mastered).length
            + account.kavats.filter(k => k.mastered).length
            + account.predasites.filter(p => p.mastered).length
            + account.vulpaphylas.filter(v => v.mastered).length;

        //8000XP Items
        const mastered8000: number = account.necramechs.filter(n => n.mastered).length;

        //Intrinsics
        const intrinsics: number = account.railjack + account.drifter;

        account.xp = (1500 * intrinsics) + (3000 * mastered3000) + (6000 * mastered6000) + (8000 * mastered8000);
        account.mastered = mastered3000 + mastered6000 + mastered8000;
        return account;
    }
}