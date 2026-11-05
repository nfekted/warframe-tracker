import { INTRINSICS } from '../metadata';
import { ItemType, Util } from '../utils/util';

// Only what the user did. Everything else (item data, XP, ranks, prices) is built from the JSONs.
export interface ProgressData {
    mastered: Partial<Record<ItemType, string[]>>;
    locations: string[];
    steelPath: string[];
    incarnons: string[];
    railjack: number;
    drifter: number;
    lang: string;
    options: ItemOptions;
    market: string[];
}

export interface ItemOptions {
    hideMastered: boolean;
    showOnlyMrAvailable: boolean;
    hideFounders: boolean;
}

export const EXPORT_APP = 'warframe-tracker';
export const EXPORT_VERSION = 1;

export interface ProgressExport {
    app: typeof EXPORT_APP;
    version: number;
    exportedAt: string;
    data: ProgressData;
}

export function emptyProgress(): ProgressData {
    return {
        mastered: {},
        locations: [],
        steelPath: [],
        incarnons: [],
        railjack: 0,
        drifter: 0,
        lang: 'en',
        options: { hideMastered: false, showOnlyMrAvailable: true, hideFounders: true },
        market: [],
    };
}

export function clampIntrinsic(value: number, max: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.min(Math.max(Math.trunc(value), 0), max);
}

const strings = (value: unknown): string[] =>
    Array.isArray(value) ? [...new Set(value.filter((v): v is string => typeof v == 'string'))] : [];

const bool = (value: unknown, fallback: boolean): boolean => typeof value == 'boolean' ? value : fallback;

// Accepts any stored or imported value and keeps only valid fields
export function sanitizeProgress(raw: unknown): ProgressData {
    const empty = emptyProgress();
    if (!raw || typeof raw != 'object') return empty;
    const data = raw as Record<string, any>;

    const mastered: ProgressData['mastered'] = {};
    for (const type of Util.itemTypes) {
        const names = strings(data['mastered']?.[type]);
        if (names.length) mastered[type] = names;
    }

    const options = data['options'] ?? {};

    return {
        mastered,
        locations: strings(data['locations']),
        steelPath: strings(data['steelPath']),
        incarnons: strings(data['incarnons']),
        railjack: clampIntrinsic(+data['railjack'], INTRINSICS.railjackMax),
        drifter: clampIntrinsic(+data['drifter'], INTRINSICS.drifterMax),
        lang: data['lang'] == 'pt' ? 'pt' : 'en',
        options: {
            hideMastered: bool(options.hideMastered, empty.options.hideMastered),
            showOnlyMrAvailable: bool(options.showOnlyMrAvailable, empty.options.showOnlyMrAvailable),
            hideFounders: bool(options.hideFounders, empty.options.hideFounders),
        },
        market: strings(data['market']),
    };
}

export function parseExport(text: string): ProgressData {
    let file: Partial<ProgressExport>;
    try {
        file = JSON.parse(text);
    } catch {
        throw new Error('invalid_file');
    }

    if (file?.app != EXPORT_APP || typeof file.version != 'number' || !file.data) throw new Error('invalid_file');
    if (file.version > EXPORT_VERSION) throw new Error('newer_version');

    return sanitizeProgress(file.data);
}
