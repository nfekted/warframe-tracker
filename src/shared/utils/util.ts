import { Account } from "../models/account.model";
import { ItemJsons } from "../models/item-jsons.model";
import { INTRINSICS } from "../metadata";
import starChart from '../jsons/locations.json';

export type ItemType = (typeof Util.itemTypes)[number];

export abstract class Util {
    static cookieName: string = 'warframetracker';

    static readonly itemTypes = [
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
    ] as const;

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
        let itemsXp = 0;
        let mastered = 0;
        for (const type of this.itemTypes) {
            for (const item of account[type]) {
                if (!item.mastered) continue;
                itemsXp += item.mastery_xp;
                mastered++;
            }
        }

        const intrinsics = (account.railjack + account.drifter) * INTRINSICS.xpPerRank;

        //Steel Path completion gives the node XP a second time
        const locations = account.locations.reduce((sum, item) => item.mastered ? sum + item.mastery_exp * (item.steel_path ? 2 : 1) : sum, 0);

        account.xp = itemsXp + intrinsics + locations;
        account.mastered = mastered;
        return account;
    }

    //Highest XP reachable with the current game data
    static maxXp(): number {
        const jsons = new ItemJsons();
        const items = this.itemTypes.reduce((sum, type) => sum + jsons[type].reduce((s, item) => s + item.mastery_xp, 0), 0);
        const locations = starChart.reduce((sum, node) => sum + node.mastery_exp * 2, 0);
        const intrinsics = (INTRINSICS.railjackMax + INTRINSICS.drifterMax) * INTRINSICS.xpPerRank;
        return items + locations + intrinsics;
    }
}