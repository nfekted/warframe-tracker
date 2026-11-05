export interface ItemData {
    name: string;
    mastery_requirement: number;
    mastery_xp: number;
    acquisition: string;
    acquisitionDescription: string;
}

export class Item {
    name: string;
    mastered: boolean = false;
    type: string;
    acquisition: string;
    mastery_requirement: number = 0;
    mastery_xp: number = 0;

    constructor(name: string, type: string, acquisition: string, mastery_requirement: number, mastery_xp: number) {
        this.name = name;
        this.type = type;
        this.acquisition = acquisition;
        this.mastery_requirement = mastery_requirement;
        this.mastery_xp = mastery_xp;
    }
}