import { InjectionToken } from '@angular/core';

export const API_ROOT = new InjectionToken<string>('API_ROOT');

export const ACCESS_TOKEN_GETTER = new InjectionToken<() => string | undefined>(
  'ACCESS_TOKEN_GETTER'
);

export const LANGUAGE_GETTER = new InjectionToken<() => string>(
  'LANGUAGE_GETTER'
);
