//Lower case and without accents, so "lamina" finds "Lâmina"
export const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
