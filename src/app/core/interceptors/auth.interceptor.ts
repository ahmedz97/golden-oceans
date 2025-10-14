import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { API_ROOT, ACCESS_TOKEN_GETTER, LANGUAGE_GETTER } from '../tokens';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiRoot = inject(API_ROOT);
  const getToken = inject(ACCESS_TOKEN_GETTER);
  const getLang = inject(LANGUAGE_GETTER);
  const platformId = inject(PLATFORM_ID); // ← أضف هذه السطر
  const isBrowser = isPlatformBrowser(platformId); // ← تحقق أنك في المتصفح

  let url = req.url;

  if (!/^https?:\/\//i.test(url) && url.startsWith('/api')) {
    url = apiRoot.replace(/\/+$/, '') + url.replace(/^\/api/, '');
  }

  if (url.includes('/login') || url.includes('/register')) {
    return next(req.clone({ url }));
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-LOCALIZE': isBrowser ? getLang() : 'en',
  };

  if (isBrowser) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Remove warnings as they're normal behavior
  }
  // Remove SSR warning as it's expected behavior during server-side rendering

  return next(req.clone({ url, setHeaders: headers }));
};
