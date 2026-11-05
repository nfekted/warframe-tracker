export class Incarnons {
    name: string;
    acquired: boolean = false;
    acquisition: string = '';
    wiki: string;

    constructor(name: string, acquisition: string, wiki: string = '') {
        this.name = name;
        this.acquisition = acquisition;
        this.wiki = wiki;
    }
}