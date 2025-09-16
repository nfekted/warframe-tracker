export class Incarnons {
    name: string;
    acquired: boolean = false;
    acquisition: string = '';

    constructor(name: string, acquisition: string) {
        this.name = name;
        this.acquisition = acquisition;
    }
}