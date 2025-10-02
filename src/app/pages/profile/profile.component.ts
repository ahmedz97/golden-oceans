import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
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
    private toaster: ToastrService
  ) {}
  updateProfile!: FormGroup;
  updateImage!: FormGroup;
  countriesList: any[] = [];
  tourCart: any[] = [];
  favList: any[] = [];
  haveData: boolean = false;
  profilemeData: any = {};

  readonly files = signal<File[]>([]);

  selectedTab: string = 'dashboard';

  ngOnInit(): void {
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

    this.getListCart();
    this.getFav();
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

  uploadImage(file: File): void {
    const userImage = new FormData();
    userImage.append('image', file);

    this._ProfileService.updateImageProfile(userImage).subscribe({
      next: (res) => {
        console.log('Uploaded ✅', res);
        this.toaster.success('Profile image updated');
      },
      error: (err) => {
        console.error('Upload error ❌', err);
        this.toaster.error(err?.error?.message || 'Upload failed');
      },
    });
  }

  // // start user profile image
  // onSelect(event: any) {
  //   console.log(event);
  //   this.files.set([...this.files(), ...event.addedFiles]);
  //   console.log(this.files);

  //   this.uploadImage(this.files);
  // }
  // onRemove(event: any) {
  //   console.log(event);
  //   const files = this.files();
  //   files.splice(files.indexOf(event), 1);
  //   this.files.set([...files]);
  //   console.log(files);
  //   this.uploadImage(files);
  // }
  // // end user profile image

  // uploadImage(img: any): void {
  //   this._ProfileService.updateImageProfile(img).subscribe({
  //     next: (res) => {
  //       console.log(res);
  //     },
  //   });
  //   console.log(img);
  // }

  getListCart(): void {
    this._BookingService.getCartList().subscribe({
      next: (response) => {
        this.tourCart = response.data;
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
      },
      error: (err) => {
        console.log(err);
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
        // this.updateProfile.patchValue({
        //   name: this.profilemeData.name,
        //   phone: this.profilemeData.phone,
        //   birthdate: this.profilemeData.birthdate?.split('T')[0],
        //   nationality: this.profilemeData.nationality,
        // });
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
    this._DataService.getWishlist().subscribe({
      next: (response) => {
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
        }
      },
      error: (err) => {
        // this.toaster.error(err.error.message, 'you must login first');
      },
    });
  }

  // addFav(id: any): void {
  //   this._DataService.toggleWishlist(id).subscribe({
  //     next: (response) => {
  //       this.myFavList = response;
  //       // toggle fav icon style (add , remove)
  //       const index = this.favouriteIds.indexOf(id);
  //       if (index > -1) {
  //         this.favouriteIds.splice(index, 1);
  //       } else {
  //         this.favouriteIds.push(id);
  //       }
  //       console.log(id);
  //       console.log(this.myFavList);
  //       this.getFav();
  //       // this.toaster.success(response.message);
  //     },
  //     error: (err) => {
  //       console.log(err);
  //       this.toaster.error(err.error.message);
  //     },
  //   });
  // }
}
