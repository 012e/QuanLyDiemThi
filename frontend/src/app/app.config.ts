import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ApiModule, BASE_PATH } from './core/api';
import {
  provideHttpClient,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { MessageService } from 'primeng/api';
import { environment } from '../environments/environment.development';
import { UnauthorizedInterceptorInterceptor } from './core/interceptors/unauthorized-interceptor.interceptor';
import { NgxPermissionsModule } from 'ngx-permissions';

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
      withInterceptors([JwtInterceptor, UnauthorizedInterceptorInterceptor]),
    ),
    importProvidersFrom(ApiModule),
    {
      provide: BASE_PATH,
      useValue: environment.apiUrl,
    },
    MessageService,
    importProvidersFrom(NgxPermissionsModule.forRoot()),
  ],
};
