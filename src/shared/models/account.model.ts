import { Incarnons } from "./incarnons.model";
import { Item } from "./item.model";
import { StarChart } from "./star-chart.model";

// View of the user's progress, built by ProgressStore from the JSONs and the saved data
export class Account {
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
    rifles: Item[] = [];
    locations: StarChart[] = [];
    incarnons: Incarnons[] = [];
}