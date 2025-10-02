import {
  ApplicationConfig,
  mergeApplicationConfig,
  inject,
} from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { API_ROOT } from './core/tokens';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),

    // استخدم الـ API الحقيقي عندك
    {
      provide: API_ROOT,
      useValue: 'https://tourism-api.perfectsolutions4u.com/api',
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
