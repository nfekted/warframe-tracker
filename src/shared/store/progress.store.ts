import { computed, Injectable, signal } from '@angular/core';
import { Account } from '../models/account.model';
import { Incarnons } from '../models/incarnons.model';
import { Item } from '../models/item.model';
import { ItemJsons } from '../models/item-jsons.model';
import { MasteryRank } from '../models/mastery-rank.model';
import { StarChart } from '../models/star-chart.model';
import { INTRINSICS } from '../metadata';
import { ItemType, Util } from '../utils/util';
import { ProgressDb } from './progress-db';
import { clampIntrinsic, emptyProgress, EXPORT_APP, EXPORT_VERSION, ItemOptions, parseExport, ProgressData, ProgressExport, sanitizeProgress } from './progress.model';
import mrJson from '../jsons/mr.json';
import starChart from '../jsons/locations.json';
import incarnon from '../jsons/incarnon.json';

const SAVE_DELAY = 300;

const toggle = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter(v => v != value) : [...list, value];

// Single owner of the user's progress: state, derived values and persistence
@Injectable({ providedIn: 'root' })
export class ProgressStore {
    private readonly db = new ProgressDb();
    private readonly jsons = new ItemJsons();
    private readonly progress = signal<ProgressData>(emptyProgress());

    private saveTimer: ReturnType<typeof setTimeout> | null = null;
    private saving: Promise<void> = Promise.resolve();

    readonly mrList: MasteryRank[] = mrJson;
    readonly itemsCount: number = Util.itemTypes.reduce((sum, type) => sum + this.jsons[type].length, 0);
    readonly maxXp: number = Util.maxXp();

    readonly account = computed(() => this.buildAccount(this.progress()));
    readonly masteryRank = computed(() => this.mrList.filter(mr => mr.xp <= this.account().xp).at(-1) ?? this.mrList[0]);
    readonly nextRank = computed(() => this.mrList.find(mr => mr.xp > this.account().xp) ?? this.mrList[this.mrList.length - 1]);
    readonly railjack = computed(() => this.progress().railjack);
    readonly drifter = computed(() => this.progress().drifter);
    readonly lang = computed(() => this.progress().lang);
    readonly options = computed(() => this.progress().options);
    readonly marketIds = computed(() => this.progress().market);

    constructor() {
        window.addEventListener('pagehide', () => this.flush());
    }

    async load(): Promise<void> {
        try {
            this.progress.set(sanitizeProgress(await this.db.load()));
        } catch (error) {
            console.error('Could not load the saved progress', error);
        }
    }

    toggleItem(type: ItemType, name: string) {
        this.update(p => ({ ...p, mastered: { ...p.mastered, [type]: toggle(p.mastered[type] ?? [], name) } }));
    }

    //Steel Path needs the normal node, so unmarking the node also unmarks its Steel Path
    toggleLocation(name: string) {
        this.update(p => {
            const locations = toggle(p.locations, name);
            const steelPath = locations.includes(name) ? p.steelPath : p.steelPath.filter(v => v != name);
            return { ...p, locations, steelPath };
        });
    }

    //Marked only after the normal node; always unmarkable, so older saves can still be fixed
    toggleSteelPath(name: string) {
        const { locations, steelPath } = this.progress();
        if (!locations.includes(name) && !steelPath.includes(name)) return;
        this.update(p => ({ ...p, steelPath: toggle(p.steelPath, name) }));
    }

    toggleIncarnon(name: string) {
        this.update(p => ({ ...p, incarnons: toggle(p.incarnons, name) }));
    }

    setRailjack(value: number) {
        this.update(p => ({ ...p, railjack: clampIntrinsic(value, INTRINSICS.railjackMax) }));
    }

    setDrifter(value: number) {
        this.update(p => ({ ...p, drifter: clampIntrinsic(value, INTRINSICS.drifterMax) }));
    }

    setLang(lang: string) {
        this.update(p => ({ ...p, lang }));
    }

    setOptions(options: Partial<ItemOptions>) {
        this.update(p => ({ ...p, options: { ...p.options, ...options } }));
    }

    addMarketItem(id: string) {
        if (this.progress().market.includes(id)) return;
        this.update(p => ({ ...p, market: [id, ...p.market] }));
    }

    removeMarketItem(id: string) {
        this.update(p => ({ ...p, market: p.market.filter(m => m != id) }));
    }

    exportData(): string {
        const file: ProgressExport = { app: EXPORT_APP, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), data: this.progress() };
        return JSON.stringify(file, null, 2);
    }

    //Replaces the current progress. Throws when the file is not a valid export
    async importData(text: string): Promise<void> {
        this.progress.set(parseExport(text));
        await this.saveNow();
    }

    async reset(): Promise<void> {
        this.cancelSave();
        await this.saving;
        await this.db.clear();
        this.progress.set(emptyProgress());
    }

    //Writes any pending change right away
    flush(): Promise<void> {
        if (this.saveTimer) return this.saveNow();
        return this.saving;
    }

    private update(change: (progress: ProgressData) => ProgressData) {
        this.progress.update(change);
        this.cancelSave();
        this.saveTimer = setTimeout(() => this.saveNow(), SAVE_DELAY);
    }

    private cancelSave() {
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = null;
    }

    private saveNow(): Promise<void> {
        this.cancelSave();
        const progress = this.progress();
        this.saving = this.saving
            .then(() => this.db.save(progress))
            .catch(error => console.error('Could not save the progress', error));
        return this.saving;
    }

    private buildAccount(progress: ProgressData): Account {
        const account = new Account();

        for (const type of Util.itemTypes) {
            const mastered = new Set(progress.mastered[type] ?? []);
            account[type] = this.jsons[type]
                .map(data => {
                    const item = new Item(data.name, type, data.acquisition, data.mastery_requirement, data.mastery_xp, data.acquisitionDescription);
                    item.mastered = mastered.has(data.name);
                    return item;
                })
                .sort((a, b) => a.name.localeCompare(b.name));
        }

        const locations = new Set(progress.locations);
        const steelPath = new Set(progress.steelPath);
        account.locations = starChart.map(node => {
            const location = new StarChart(node.name, node.mastery_exp, node.planet);
            location.mastered = locations.has(node.name);
            location.steel_path = steelPath.has(node.name);
            return location;
        });

        const acquired = new Set(progress.incarnons);
        account.incarnons = incarnon.map(data => {
            const item = new Incarnons(data.name, data.acquisition, data.acquisitionDescription);
            item.acquired = acquired.has(data.name);
            return item;
        });

        account.railjack = progress.railjack;
        account.drifter = progress.drifter;
        return Util.calculate(account);
    }
}
