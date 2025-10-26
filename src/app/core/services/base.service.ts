import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  constructor(protected HttpClient: HttpClient) {}
  baseUrl = 'https://tourism-api.perfectsolutions4u.com/api';
  // baseUrl = 'https://backend-goldenoceans.perfectsolutions4u.com/api';
}
