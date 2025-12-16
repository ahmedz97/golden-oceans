import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService extends BaseService {
  // tour details
  appendBookingData(bookingForm: object): Observable<any> {
    return this.HttpClient.post(
      `${this.baseUrl}/cart/tours/append`,
      bookingForm
    );
  }

  // cart
  getCartList(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/cart/list`);
  }

  deleteTourCart(tourCart: any): Observable<any> {
    return this.HttpClient.delete(`${this.baseUrl}/cart/remove/${tourCart}`);
  }

  clearTourCart(): Observable<any> {
    return this.HttpClient.delete(`${this.baseUrl}/cart/clear`);
  }

  //checkout coupon
  getCoupon(code: any): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/coupons/${code}/validate`);
  }

  getBookings(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/bookings`);
  }

  sendCheckoutData(checkoutData: object): Observable<any> {
    return this.HttpClient.post(`${this.baseUrl}/bookings`, checkoutData);
  }

  getCountries(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/countries`);
  }

  // loyalty
  getLoyaltyCredit(): Observable<any> {
    return this.HttpClient.get(`${this.baseUrl}/loyalty/account`);
  }

  sendLoyaltyTransferCredit(loyaltyData: object): Observable<any> {
    return this.HttpClient.post(
      `${this.baseUrl}/loyalty/transfer-points`,
      loyaltyData
    );
  }

  loyaltyCheckPreview(checkoutPreviewData: object): Observable<any> {
    return this.HttpClient.post(
      `${this.baseUrl}/loyalty/checkout-preview`,
      checkoutPreviewData
    );
  }
  // ----
}
