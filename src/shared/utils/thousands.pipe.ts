import { Pipe, PipeTransform } from '@angular/core';

//Groups digits the way the app language does: 3,087,038 in English, 3.087.038 in Portuguese
@Pipe({ name: 'thousands' })
export class ThousandsPipe implements PipeTransform {
  transform(value: number, lang: string): string {
    return new Intl.NumberFormat(lang == 'pt' ? 'pt-BR' : 'en-US').format(value);
  }
}
