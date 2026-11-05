import { deleteDB, IDBPDatabase, openDB } from 'idb';
import { ProgressData } from './progress.model';

const DB_NAME = 'warframe-tracker';
const STORE = 'state';
const KEY = 'progress';

// Own database, so deleting it never touches data from other apps on the same origin
export class ProgressDb {
    private db: Promise<IDBPDatabase> | null = null;

    private open(): Promise<IDBPDatabase> {
        this.db ??= openDB(DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(STORE);
            },
            //Another tab is deleting the database: let it go and reopen on the next use
            blocking: () => this.close(),
        });
        return this.db;
    }

    private close() {
        this.db?.then(db => db.close());
        this.db = null;
    }

    async load(): Promise<unknown> {
        return (await this.open()).get(STORE, KEY);
    }

    async save(progress: ProgressData): Promise<void> {
        await (await this.open()).put(STORE, progress, KEY);
    }

    async clear(): Promise<void> {
        this.close();
        await deleteDB(DB_NAME);
    }
}
