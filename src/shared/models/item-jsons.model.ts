import { ItemData } from './item.model';
import warframesJson from '../jsons/warframes.json';
import archwingJson from '../jsons/archwings.json';
import kDriveJson from '../jsons/kdrives.json';
import necramechJson from '../jsons/necramech.json';
import houndsJson from '../jsons/hounds.json';
import moasJson from '../jsons/moas.json';
import sentinelsJson from '../jsons/sentinels.json';
import companionWeaponJson from '../jsons/companion-weapon.json';
import kubrowJson from '../jsons/kubrows.json';
import kavatsJson from '../jsons/kavats.json';
import predasiteJson from '../jsons/predasites.json';
import vulpaphylasJson from '../jsons/vulpaphylas.json';
import ampsJson from '../jsons/amps.json';
import zawJson from '../jsons/zaws.json';
import kitgunJson from '../jsons/kitguns.json';
import archMeleeJson from '../jsons/archwing-melee.json';
import archPrimaryJson from '../jsons/archwing-primary.json';
import plexusJson from '../jsons/plexusJson.json';
import meleeJson from '../jsons/melee.json';
import pistolsJson from '../jsons/pistols.json';
import riflesJson from '../jsons/rifles.json';

export class ItemJsons {

    warframes: ItemData[] = warframesJson;
    archwings: ItemData[] = archwingJson;
    kdrives: ItemData[] = kDriveJson;
    necramechs: ItemData[] = necramechJson;
    hounds: ItemData[] = houndsJson;
    moas: ItemData[] = moasJson;
    sentinels: ItemData[] = sentinelsJson;
    companion_weapon: ItemData[] = companionWeaponJson;
    kubrows: ItemData[] = kubrowJson;
    kavats: ItemData[] = kavatsJson;
    vulpaphylas: ItemData[] = vulpaphylasJson;
    predasites: ItemData[] = predasiteJson;
    amps: ItemData[] = ampsJson;
    kitguns: ItemData[] = kitgunJson;
    zaws: ItemData[] = zawJson;
    archwing_melee: ItemData[] = archMeleeJson;
    archwing_primary: ItemData[] = archPrimaryJson;
    plexus: ItemData[] = plexusJson;
    melees: ItemData[] = meleeJson;
    pistols: ItemData[] = pistolsJson;
    rifles: ItemData[] = riflesJson;

    constructor() {

    }
}