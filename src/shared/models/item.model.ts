export class Item {
    name: string;
    mastered: boolean = false;
    type: string;
    acquisition: string;
    mastery_requirement: number = 0;

    constructor(name: string, type: string, acquisition: string, mastery_requirement: number) {
        this.name = name;
        this.type = type;
        this.acquisition = acquisition;
        this.mastery_requirement = mastery_requirement;
    }
}