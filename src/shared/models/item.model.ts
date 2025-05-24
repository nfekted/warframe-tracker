export class Item {
    name: string;
    mastered: boolean = false;
    type: string;
    acquisition: string;

    constructor(name: string, type: string, acquisition: string) {
        this.name = name;
        this.type = type;
        this.acquisition = acquisition;
    }
}