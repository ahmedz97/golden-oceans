// ✅ app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
} from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideNgxCountAnimations } from 'ngx-count-animation';
import { provideClientHydration } from '@angular/platform-browser';
import { PLATFORM_ID } from '@angular/core';
import {
  HashLocationStrategy,
  isPlatformBrowser,
  LocationStrategy,
} from '@angular/common';
import { API_ROOT, ACCESS_TOKEN_GETTER, LANGUAGE_GETTER } from './core/tokens';
import { HttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
    provideClientHydration(),
    provideNativeDateAdapter(),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      extendedTimeOut: 1000,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true,
      disableTimeOut: false,
    }),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, loaderInterceptor])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    provideNgxCountAnimations(),
    {
      provide: API_ROOT,
      useValue: 'https://backend-goldenoceans.perfectsolutions4u.com/api',
    },
    {
      provide: ACCESS_TOKEN_GETTER,
      useFactory: (platformId: Object) => {
        const isBrowser = isPlatformBrowser(platformId);
        return () =>
          isBrowser
            ? localStorage.getItem('accessToken') ?? undefined
            : undefined;
      },
      deps: [PLATFORM_ID],
    },
    {
      provide: LANGUAGE_GETTER,
      useFactory: (platformId: Object) => {
        const isBrowser = isPlatformBrowser(platformId);
        return () => {
          return isBrowser ? localStorage.getItem('language') ?? 'en' : 'en';
        };
      },
      deps: [PLATFORM_ID],
    },
  ],
};

function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}
