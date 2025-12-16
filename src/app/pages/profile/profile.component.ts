import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import {
  NgxDropzoneComponent,
  NgxDropzoneLabelDirective,
  NgxDropzoneImagePreviewComponent,
} from 'ngx-dropzone-next';
import { BookingService } from '../../core/services/booking.service';
import { ProfileService } from '../../core/services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../core/services/data.service';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { TourCartComponent } from '../../components/tour-cart/tour-cart.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterLink,
    NgxDropzoneComponent,
    NgxDropzoneLabelDirective,
    NgxDropzoneImagePreviewComponent,
    CommonModule,
    ReactiveFormsModule,
    CarouselModule,
    TourCartComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,

  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _BookingService: BookingService,
    private _ProfileService: ProfileService,
    private _Router: Router,
    private toaster: ToastrService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private translate: TranslateService
  ) {}
  updateProfile!: FormGroup;
  updateImage!: FormGroup;
  transferLoyaltyCreditForm!: FormGroup;
  countriesList: any[] = [];
  tourCart: any[] = [];
  favList: any[] = [];
  haveData: boolean = false;
  profilemeData: any = {};
  loyaltyCredit: any = { points: 0 };
  uploadedImageMassage: string = '';
  bookings: any[] = [];
  readonly files = signal<File[]>([]);

  selectedTab: string = 'dashboard';

  ngOnInit(): void {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');

    if (token) {
      this.showCountries();
      this.profileMe();
      this.updateProfile = new FormGroup({
        name: new FormControl(''),
        password: new FormControl(''),
        password_confirmation: new FormControl(''),
        phone: new FormControl(''),
        // email: new FormControl(''),
        nationality: new FormControl(''),
      });
      this.updateImage = new FormGroup({
        image: new FormControl(''),
      });
      this.transferLoyaltyCreditForm = new FormGroup({
        recipient_email: new FormControl(''),
        points: new FormControl(''),
        notes: new FormControl(''),
      });

      this.getListCart();
      this.getFav();
      this.getLoyaltyCredit();
      this.getBookings();
    } else {
      // Show error message using translation
      this.translate
        .get('messages.mustBeLoggedIn')
        .subscribe((message: string) => {
          this.toaster.error(message);
        });
      this._Router.navigate(['/login']);
    }
  }

  // عند الاختيار
  onSelect(evt: any) {
    const added: File[] = evt?.addedFiles ?? [];
    if (!added.length) return;

    const file = added[0]; // صورة واحدة فقط
    this.files.set([file]);

    this.uploadImage(file);
  }

  // عند الإزالة من الـ UI
  onRemove(file: File) {
    this.files.set([]);
    // (اختياري) تقدر تستدعي API لحذف الصورة من السيرفر لو عندك endpoint لذلك
  }

  // Remove existing image from URL
  onRemoveExistingImage() {
    this.updateImage.patchValue({
      image: '',
    });
    this.profilemeData.image = '';
    this.cdr.detectChanges();
  }

  uploadImage(file: File): void {
    const userImage = new FormData();
    userImage.append('image', file);

    this._ProfileService.updateImageProfile(userImage).subscribe({
      next: (res) => {
        console.log('Uploaded ✅', res);
        this.toaster.success('Profile image updated');
        const imageUrl = res.data.image;
        this.updateImage.patchValue({
          image: imageUrl,
        });
        // Update profile data to persist the image
        this.profilemeData.image = imageUrl;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Upload error ❌', err);
        this.toaster.error(err?.error?.message || 'Upload failed');
        this.uploadedImageMassage = err?.error?.message || 'Upload failed';
        // Remove file from dropzone on error
        this.files.set([]);
        this.cdr.detectChanges();
      },
    });
  }

  getListCart(): void {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'profile.component.ts:146',
        message: 'getListCart entry',
        data: {},
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    this._BookingService.getCartList().subscribe({
      next: (response) => {
        // #region agent log
        fetch(
          'http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'profile.component.ts:149',
              message: 'getListCart response received',
              data: {
                responseDataExists: !!response.data,
                responseDataType: Array.isArray(response.data)
                  ? 'array'
                  : typeof response.data,
                responseDataLength: Array.isArray(response.data)
                  ? response.data.length
                  : 'N/A',
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'C',
            }),
          }
        ).catch(() => {});
        // #endregion
        this.tourCart = response.data;
        // #region agent log
        fetch(
          'http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'profile.component.ts:151',
              message: 'tourCart assigned BEFORE length check',
              data: {
                tourCartLength: this.tourCart.length,
                tourCartIsArray: Array.isArray(this.tourCart),
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            }),
          }
        ).catch(() => {});
        // #endregion
        if (this.tourCart.length === 0) {
          this.haveData = false;
          console.log(this.tourCart);
        } else {
          this.tourCart = response.data.map((tour: any) => ({
            ...tour,
            totalPrice:
              tour.adults * tour.tour.adult_price +
              tour.children * tour.tour.child_price +
              tour.infants * tour.tour.infant_price,
          }));
          this.haveData = true;
          console.log(this.tourCart);
        }
        // #region agent log
        fetch(
          'http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'profile.component.ts:163',
              message: 'tourCart assigned AFTER processing',
              data: {
                tourCartLength: this.tourCart.length,
                changeDetectionCalled: true,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            }),
          }
        ).catch(() => {});
        // #endregion
        // Trigger change detection for OnPush strategy
        this.cdr.detectChanges();
      },
      error: (err) => {
        // #region agent log
        fetch(
          'http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'profile.component.ts:165',
              message: 'getListCart error',
              data: { error: err?.message || 'unknown' },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'C',
            }),
          }
        ).catch(() => {});
        // #endregion
        console.log(err);
      },
    });
  }

  getBookings(): void {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'profile.component.ts:171',
        message: 'getBookings entry',
        data: {},
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    this._BookingService.getBookings().subscribe({
      next: (response) => {
        // #region agent log
        fetch(
          'http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'profile.component.ts:174',
              message: 'getBookings response received',
              data: {
                responseDataExists: !!response.data,
                responseDataDataExists: !!response.data?.data,
                responseDataDataLength: Array.isArray(response.data?.data)
                  ? response.data.data.length
                  : 'N/A',
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'C',
            }),
          }
        ).catch(() => {});
        // #endregion
        console.log(response.data.data);
        this.bookings = response.data.data;
        // #region agent log
        fetch(
          'http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'profile.component.ts:176',
              message: 'bookings assigned',
              data: {
                bookingsLength: this.bookings.length,
                bookingsIsArray: Array.isArray(this.bookings),
                changeDetectionCalled: true,
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'A',
            }),
          }
        ).catch(() => {});
        // #endregion
        // Trigger change detection for OnPush strategy
        this.cdr.detectChanges();
      },
    });
  }

  showCountries(): void {
    this._BookingService.getCountries().subscribe({
      next: (response) => {
        console.log(response.data);
        this.countriesList = response.data;
      },
    });
  }

  submitProfileData(): void {
    if (this.updateProfile.valid) {
      const profileData = this.updateProfile.value;
      console.log(profileData);
      this._ProfileService.updateProfile(profileData).subscribe({
        next: (response) => {
          console.log(response);
          this.toaster.success(response.error.message);
        },
        error: (err) => {
          console.log(err);
          this.toaster.error(err.error.message);
        },
      });
    } else {
      console.log('nooooo');
    }
  }

  profileMe(): void {
    this._ProfileService.getProfile().subscribe({
      next: (response) => {
        this.profilemeData = response.data;
        console.log(this.profilemeData);
        this.updateProfile.patchValue({
          name: this.profilemeData.name,
          phone: this.profilemeData.phone,
          birthdate: this.profilemeData.birthdate?.split('T')[0],
          nationality: this.profilemeData.nationality,
        });

        // Set image in form
        if (this.profilemeData.image) {
          this.updateImage.patchValue({
            image: this.profilemeData.image,
          });
          // Image will be displayed directly from URL in the template
          // No need to convert to File object (avoids CORS issues)
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        // console.log(localStorage.getItem('accessToken'));
      },
    });
  }

  logout(): void {
    this._ProfileService.logoutProfile().subscribe({
      next: (response) => {
        // console.log(response);
        localStorage.removeItem('accessToken');
        // navigate it to home
        this._Router.navigate(['']);
        // console.log('ahmed');
        this.toaster.success(response.message);
      },
      error: (err) => {
        // console.log(err);
        this.toaster.error(err.error.message);
      },
    });
  }

  bookingOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: true,
    smartSpeed: 1500,
    margin: 50,
    responsive: {
      0: { items: 1 },
      586: { items: 2 },
    },
    nav: false,
    // navText: [
    //   '<i class="fa fa-angle-double-left"></i>',
    //   '<i class="fa fa-angle-double-right"></i>',
    // ],
  };

  getFav(): void {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'profile.component.ts:264',
        message: 'getFav entry',
        data: {},
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
    // #endregion
    this._DataService.getWishlist().subscribe({
      next: (response) => {
        // #region agent log
        fetch(
          'http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'profile.component.ts:267',
              message: 'getFav response received',
              data: {
                hasToken: !!localStorage.getItem('accessToken'),
                responseDataExists: !!response.data,
                responseDataDataExists: !!response.data?.data,
                responseDataDataLength: Array.isArray(response.data?.data)
                  ? response.data.data.length
                  : 'N/A',
              },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'C',
            }),
          }
        ).catch(() => {});
        // #endregion
        if (localStorage.getItem('accessToken')) {
          this.favList = response.data.data;
          console.log(response.data.data);
          if (this.favList.length === 0) {
            this.haveData = false;
            console.log(this.favList.length);
          } else {
            this.haveData = true;
            console.log(response.data.data);
            this.favList = response.data.data;
          }
          // #region agent log
          fetch(
            'http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'profile.component.ts:277',
                message: 'favList assigned',
                data: {
                  favListLength: this.favList.length,
                  favListIsArray: Array.isArray(this.favList),
                  changeDetectionCalled: true,
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'A',
              }),
            }
          ).catch(() => {});
          // #endregion
          // Trigger change detection for OnPush strategy
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        // #region agent log
        fetch(
          'http://127.0.0.1:7243/ingest/fac1b97a-8f9a-4c6b-b088-6ca686e5c437',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'profile.component.ts:280',
              message: 'getFav error',
              data: { error: err?.message || 'unknown' },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              runId: 'run1',
              hypothesisId: 'C',
            }),
          }
        ).catch(() => {});
        // #endregion
        // this.toaster.error(err.error.message, 'you must login first');
      },
    });
  }

  getLoyaltyCredit(): void {
    this._BookingService.getLoyaltyCredit().subscribe({
      next: (response) => {
        this.loyaltyCredit = response.data;
        console.log(this.loyaltyCredit.points);
        // Trigger change detection for OnPush strategy
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching loyalty credit:', err);
      },
    });
  }

  transferLoyaltyCredit(): void {
    if (this.transferLoyaltyCreditForm.valid) {
      console.log(this.transferLoyaltyCreditForm.value);
      this._BookingService
        .sendLoyaltyTransferCredit(this.transferLoyaltyCreditForm.value)
        .subscribe({
          next: (response) => {
            console.log(response);
            this.toaster.success(response.message);
          },
          error: (err) => {
            this.toaster.error(err.error.message);
          },
        });
    } else {
      console.log('not done');
    }
  }
}
