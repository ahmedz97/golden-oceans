import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../core/services/booking.service';
import { ToastrService } from 'ngx-toastr';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from '../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatRadioModule,
    ReactiveFormsModule,
    CarouselModule,
    TranslateModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  constructor(
    private _BookingService: BookingService,
    private toaster: ToastrService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  isLoggedIn = this.authService.isLoggedIn; // this will be used in the template to check if the user is logged in

  checkoutData: object = {};
  countries: any[] = [];
  tourCart: any[] = [];
  haveData: boolean = false;
  couponApplied: boolean = false;
  couponDiscount: number = 0;
  couponData: any = null;

  ngOnInit(): void {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');

    if (token) {
      this._BookingService.getCountries().subscribe({
        next: (response) => {
          // console.log(response.data);
          this.countries = response.data;
        },
      });
      this.getListCart();
      this.getLoyaltyCredit();
    } else {
      // Show error message using translation
      this.translate
        .get('messages.mustBeLoggedIn')
        .subscribe((message: string) => {
          this.toaster.error(message);
        });
      this.router.navigate(['/login']);
    }
  }

  checkoutForm: FormGroup = new FormGroup({
    first_name: new FormControl(''),
    last_name: new FormControl(''),
    phone: new FormControl(''),
    email: new FormControl(''),
    country: new FormControl(''),
    // state: new FormControl(''),
    payment_method: new FormControl(''),
    notes: new FormControl(''),
    currency_id: new FormControl(1),
    coupon_id: new FormControl(''),
    loyalty_credit_used: new FormControl(0),
  });

  getCheckoutData(): void {
    this.checkoutData = this.checkoutForm.value;
    // console.log(this.checkoutData);
    // console.log(this.checkoutForm.get('coupon_id')?.value);

    // if form is valid === true
    if (this.checkoutForm.valid) {
      this._BookingService.sendCheckoutData(this.checkoutData).subscribe({
        next: (response) => {
          console.log(response);
          this.toaster.success(response.message);
        },
        error: (err) => {
          console.log(err);
          this.toaster.error(err.error.message);
        },
      });
    }

    // this.checkoutForm.reset();
  }

  getListCart(): void {
    this._BookingService.getCartList().subscribe({
      next: (response) => {
        this.tourCart = response.data;
        if (this.tourCart.length === 0) {
          this.haveData = false;
          // console.log(this.tourCart);
        } else {
          this.haveData = true;
          // console.log(this.tourCart);

          this.tourCart.forEach((item) => {
            let adultPrice = 0;
            let childPrice = 0;
            let infantPrice = 0;

            if (item.tour?.pricing_groups?.length > 0) {
              const matchedGroup = item.tour.pricing_groups.find(
                (group: { from: number; to: number }) =>
                  item.adults >= group.from && item.adults <= group.to
              );

              if (matchedGroup) {
                adultPrice = matchedGroup.price;
                childPrice = matchedGroup.child_price;
              } else {
                adultPrice = item.tour.adult_price;
                childPrice = item.tour.child_price;
                infantPrice = item.tour.infant_price;
              }
            } else {
              adultPrice = item.tour.adult_price;
              childPrice = item.tour.child_price;
              infantPrice = item.tour.infant_price;
            }

            item.adultPrice = adultPrice;
            item.childPrice = childPrice;
            item.infantPrice = infantPrice;
            item.totalPrice =
              item.adults * item.adultPrice +
              item.children * item.childPrice +
              item.infants * item.infantPrice;
          });

          // discount cart
          this._BookingService
            .loyaltyCheckPreview({
              total_amount: this.getTotalPrice(),
              loyalty_credit_to_use: this.loyaltyCredit.credit_balance,
            })
            .subscribe({
              next: (res) => {
                this.toaster.success(res.message);
                this.checkoutPreview = res.data;
                console.log(this.checkoutPreview);
              },
              error: (err) => {
                console.log(err);
              },
            });
        }
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  loyaltyCredit: any = {};
  checkoutPreview: any = {};
  getLoyaltyCredit(): void {
    this._BookingService.getLoyaltyCredit().subscribe({
      next: (response) => {
        this.loyaltyCredit = response.data;
        console.log(this.loyaltyCredit);
        // Trigger change detection for OnPush strategy
        // this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching loyalty credit:', err);
      },
    });
  }

  handleDiscount(): void {
    this.checkoutForm.patchValue({
      loyalty_credit_used: this.checkoutPreview.discount_amount,
    });
    console.log('discount amount =>', this.checkoutPreview.discount_amount);
  }

  getTotalPrice(): number {
    return this.tourCart.reduce((sum, cart) => sum + cart.totalPrice, 0);
  }

  applyCoupon(): void {
    const couponCode = this.checkoutForm.get('coupon_id')?.value;

    if (!couponCode || couponCode.trim() === '') {
      this.toaster.error('Please enter a coupon code');
      return;
    }

    this._BookingService.getCoupon(couponCode).subscribe({
      next: (cResponse) => {
        console.log(cResponse);
        this.couponApplied = true;
        this.couponData = cResponse.data;

        // Calculate discount based on coupon type (percentage or fixed amount)
        const totalPrice = this.getTotalPrice();
        if (this.couponData.type === 'percentage') {
          this.couponDiscount = (totalPrice * this.couponData.value) / 100;
        } else {
          this.couponDiscount = this.couponData.value;
        }

        this.toaster.success(
          cResponse.message || 'Coupon applied successfully!'
        );
      },
      error: (cError) => {
        console.log(cError);
        this.couponApplied = false;
        this.couponDiscount = 0;
        this.couponData = null;
        this.toaster.error(cError.error.message || 'Invalid coupon code');
      },
    });

    this.checkoutForm.get('coupon_id')?.reset();
  }

  getTotalPriceAfterCouponCode(): number {
    const totalPrice = this.getTotalPrice();

    if (this.couponApplied && this.couponDiscount > 0) {
      const finalPrice = totalPrice - this.couponDiscount;
      return finalPrice > 0 ? finalPrice : 0;
    }

    return totalPrice;
  }

  ordersOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: true,
    margin: 20,
    items: 1,
    nav: false,
    smartSpeed: 1500,
  };
}
