export class StarChart {
    name: string;
    mastered: boolean = false;
    steel_path: boolean = false;
    mastery_exp: number = 0;
    planet: string;
    wiki: string;

    constructor(name: string, mastery_exp: number, planet: string) {
        this.name = name;
        this.mastery_exp = mastery_exp;
        this.planet = planet;
        this.wiki = `https://wiki.warframe.com/w/${name}`;
    }
}