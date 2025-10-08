import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  userdata: any;

  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {
    super(http);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.loggedIn.next(this.hasToken());
    }
  }

  loginSuccess(response: any): void {
    const token = response?.data.accessToken;
    console.log(token);

    if (typeof token === 'string' && token.length > 0) {
      if (
        typeof window !== 'undefined' &&
        typeof localStorage !== 'undefined'
      ) {
        localStorage.setItem('accessToken', token);
      }
      this.loggedIn.next(true);
      this.saveUserData();
    } else {
      console.warn('No token string found in response');
    }
  }

  private getStoredTokenString(): string | undefined {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined')
      return undefined;

    const raw = localStorage.getItem('accessToken');
    return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
  }

  private hasToken(): boolean {
    return !!this.getStoredTokenString();
  }

  saveUserData(): void {
    const token = this.getStoredTokenString();
    // فك شفرة فقط لو JWT (فيه نقطتين)
    if (token && token.split('.').length === 3) {
      try {
        this.userdata = jwtDecode(token);
      } catch {}
    }
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.loggedIn.next(false);
    this.userdata = null;
  }

  setRegister(userData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/auth/register`, userData);
  }

  setlogin(userData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/auth/login`, userData);
  }

  setForgetPass(userEmail: any): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/auth/password/forget`, {
      email: userEmail,
    });
  }

  setOTP(userData: object): Observable<any> {
    return this.HttpClient.post(
      `${this.baseUrl}/auth/password/otp/verify`,
      userData
    );
  }
}
