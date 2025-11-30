import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MaketripService extends BaseService {
  sendDataTrip(tripData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/custom/trips`, tripData);
  }
  getDestination(parent_id?: any): Observable<any> {
    let paramsId = new HttpParams();
    if (parent_id) {
      paramsId = paramsId.set('parent_id', parent_id);
    }

    return this.HttpClient.get(`${this.baseUrl}/destinations`, {
      params: paramsId,
    });
  }
}
