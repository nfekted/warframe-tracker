import { Item } from "./item.model";
import { MasteryRank } from "./mastery-rank.model";

export class Account {
    masteryRank: MasteryRank;
    xp: number = 0;
    mastered: number = 0;
    railjack: number = 0;
    drifter: number = 0;
    warframes: Item[] = [];
    archwings: Item[] = [];
    plexus: Item[] = [];
    kdrives: Item[] = [];
    necramechs: Item[] = [];
    kubrows: Item[] = [];
    predasites: Item[] = [];
    vulpaphylas: Item[] = [];
    kavats: Item[] = [];
    hounds: Item[] = [];
    moas: Item[] = [];
    sentinels: Item[] = [];
    companion_weapon: Item[] = [];
    amps: Item[] = [];
    zaws: Item[] = [];
    kitguns: Item[] = [];
    archwing_melee: Item[] = [];
    archwing_primary: Item[] = [];
    melees: Item[] = [];
    pistols: Item[] = [];

    constructor() {

    }
}