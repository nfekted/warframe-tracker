import { Account } from "../models/account.model";

export abstract class Util {
    static cookieName: string = 'warframetracker';

    static itemTypes: string[] = [
        'warframes',
        'rifles',
        'pistols',
        'melees',

        'kubrows',
        'kavats',
        'predasites',
        'vulpaphylas',
        'moas',
        'hounds',
        'sentinels',
        'companion_weapon',

        'plexus',
        'necramechs',
        'kdrives',
        'amps',

        'archwings',
        'archwing_melee',
        'archwing_primary',

        'zaws',
        'kitguns',
    ];

    static load() {
        return JSON.parse(window.localStorage.getItem(this.cookieName));
    }

    static save(account: Account) {
        const obj: Account = Object.assign({}, account);

        for (const type of this.itemTypes) {
            obj[type] = obj[type].filter(i => i.mastered);
        }

        delete obj.masteryRank;
        delete obj.xp;
        delete obj.mastered;
        window.localStorage.setItem(this.cookieName, JSON.stringify(obj));
    }

    static loadMarket() {
        return JSON.parse(window.localStorage.getItem('NKDTools-WTMarket'))
    }

    static saveMarket(itensList) {
        window.localStorage.setItem('NKDTools-WTMarket', JSON.stringify(itensList));
    }

    static saveOptions(options) {
        window.localStorage.setItem('NFDTools-WTOptions', JSON.stringify(options));
    }

    static loadOptions() {
        return JSON.parse(window.localStorage.getItem('NFDTools-WTOptions'));
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

        const extra1000: number = account.rifles.filter(r => (r.name.toUpperCase().includes('KUVA ') || r.name.toUpperCase().includes('CODA ') || r.name.toUpperCase().includes('TENET ')) && r.mastered).length
            + account.pistols.filter(r => (r.name.toUpperCase().includes('KUVA ') || r.name.toUpperCase().includes('CODA ') || r.name.toUpperCase().includes('TENET ')) && r.mastered).length
            + account.melees.filter(r => (r.name == 'Paracesis' || r.name.toUpperCase().includes('KUVA ') || r.name.toUpperCase().includes('CODA ') || r.name.toUpperCase().includes('TENET ')) && r.mastered).length
            + account.archwing_primary.filter(r => r.name.toUpperCase().includes('KUVA ') && r.mastered).length;

        //Intrinsics
        const intrinsics: number = account.railjack + account.drifter;

        //Locations
        const locations: number = account.locations.reduce((sum, item) => { return (item.mastered ? sum + item.mastery_exp + (item.steel_path ? item.mastery_exp : 0) : sum) }, 0);

        account.xp = (1500 * intrinsics) + (3000 * mastered3000) + (6000 * mastered6000) + (8000 * mastered8000) + (1000 * extra1000) + locations;
        account.mastered = mastered3000 + mastered6000 + mastered8000;
        return account;
    }
}