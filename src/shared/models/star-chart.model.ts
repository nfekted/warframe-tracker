export class StarChart {
    name: string;
    mastered: boolean = false;
    mastery_exp: number = 0;
    planet: string;

    constructor(name: string, mastered: boolean, mastery_exp: number, planet: string) {
        this.name = name;
        this.mastered = mastered;
        this.mastery_exp = mastery_exp;
        this.planet = planet;
    }
}