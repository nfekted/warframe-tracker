import { ApplicationConfig, inject, isDevMode, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { ProgressStore } from '../shared/store/progress.store';

//Saved progress is loaded before the first render, so the screen never shows an empty account
async function loadProgress() {
  const store = inject(ProgressStore);
  const transloco = inject(TranslocoService);
  await store.load();
  transloco.setActiveLang(store.lang());
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withXhr()), provideTransloco({
    config: {
      availableLangs: ['en', 'pt'],
      defaultLang: 'en',
      reRenderOnLangChange: true,
      prodMode: !isDevMode(),
    },
    loader: TranslocoHttpLoader
  }), provideAppInitializer(loadProgress)]
};
