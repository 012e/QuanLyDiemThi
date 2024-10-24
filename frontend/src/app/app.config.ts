import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ApiModule, BASE_PATH } from './core/api';
import { provideHttpClient, withXsrfConfiguration } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'csrftoken',
        headerName: 'X-CSRFToken',
      }),
    ),
    importProvidersFrom(ApiModule),
    {
      provide: BASE_PATH,
      useValue: 'http://localhost:8000',
    },
  ],
};
