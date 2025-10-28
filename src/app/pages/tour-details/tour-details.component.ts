import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CarouselComponent,
  CarouselModule,
  OwlOptions,
} from 'ngx-owl-carousel-o';
import { DataService } from '../../core/services/data.service';
import { Itour } from '../../core/interfaces/itour';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BookingService } from '../../core/services/booking.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { FaqContentComponent } from '../../components/faq-content/faq-content.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

declare const bootstrap: any; // لو بتستخدم Bootstrap 5 bundle من سكريبت

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [
    CarouselModule,
    CommonModule,
    MatTabsModule,
    MatExpansionModule,
    FaqContentComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.scss',
})
export class TourDetailsComponent implements OnInit, AfterViewInit {
  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private toaster: ToastrService,
    private _BookingService: BookingService,
    private sanitizer: DomSanitizer,
    @Inject(DOCUMENT) private document: Document //  controls nav scroll
  ) {}

  @ViewChild('owlRef') owlRef?: CarouselComponent;
  renderCarousel = false;

  ngAfterViewInit() {
    const el = document.getElementById('galleryModal');
    if (!el) return;

    el.addEventListener('shown.bs.modal', () => {
      this.renderCarousel = false;
      setTimeout(() => (this.renderCarousel = true), 0); // يجبر إعادة الإنشاء بعد الفتح
    });

    el.addEventListener('hidden.bs.modal', () => {
      this.renderCarousel = false; // خليه يفصل لما يتقفل
    });
  }

  // start controls nav scroll
  private offsetTop = 330;

  getSanitizedHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
  scrollTo(id: string) {
    const el = this.document.getElementById(id);
    if (!el) return;

    const y =
      el.getBoundingClientRect().top + window.pageYOffset - this.offsetTop;

    window.scrollTo({
      top: y,
      behavior: 'smooth',
    });
  }

  // end controls nav scroll

  panelOpenState = false;

  tourData: Itour | null = null;

  tourDetailsSlug: string = '';

  tourItenary: any[] = [];
  tourGallery: any[] = [];
  tourIncluded: any[] = [];
  tourExcluded: any[] = [];
  tourReviews: any[] = [];

  adultPrice: number = 0;
  childPrice: number = 0;
  infantPrice: number = 0;
  totalPrice: number = 0;

  faqsList: any[] = [{}];

  bookingFormData!: FormGroup;

  writeReview!: FormGroup;
  isLoading: boolean = false;

  phoneNumber: any;
  userEmail: any;

  ngOnInit(): void {
    this.writeReview = new FormGroup({
      reviewer_name: new FormControl(''),
      rate: new FormControl('', [
        Validators.required,
        Validators.min(0),
        Validators.max(5),
      ]),
      confirm: new FormControl(''),
      content: new FormControl(''),
      tour_id: new FormControl(null),
    });

    this.bookingFormData = new FormGroup({
      start_date: new FormControl(),
      adults: new FormControl(1),
      children: new FormControl(0),
      infants: new FormControl(0),
      tour_id: new FormControl(null),
    });

    this._ActivatedRoute.paramMap.subscribe({
      next: (param) => {
        this.tourDetailsSlug = param.get('slug') ?? '';
        // console.log(this.tourDetailsSlug);
        this.getTour(this.tourDetailsSlug);
      },
    });

    this.getFAQs();
    this.getSettings();
  }

  getTour(slug: string) {
    this._DataService.getToursSlug(slug).subscribe({
      next: (response) => {
        // console.log(response.data);
        this.tourData = response.data;
        this.tourItenary = response.data?.days;
        this.tourGallery = response.data?.gallery;
        console.log(this.tourData);

        this.tourIncluded = this.tourData?.included
          ? this.tourData.included.split(',')
          : [];
        this.tourExcluded = this.tourData?.excluded
          ? this.tourData.excluded.split(',')
          : [];

        if (
          this.tourData?.destinations &&
          Array.isArray(this.tourData.destinations)
        ) {
          this.tourData.destinationsTitle = this.tourData.destinations
            .map((x: any) => x.title)
            .join(',');
          // console.log(this.tourData.destinationsTitle);
        }

        // console.log(this.tourData?.destinationsTitle);

        this.writeReview.patchValue({ tour_id: response.data.id });
        this.bookingFormData.patchValue({ tour_id: response.data.id });
        this.getTourPricing(1);
        this.getReview(); // Fetch reviews for this specific tour
      },
      error: (err) => {
        this.toaster.error(err.error.message);
      },
    });
  }

  // check pricing
  getTourPricing(adultNum: number) {
    if (!this.tourData) {
      this.toaster.error('No data available.');
      // console.log('No data available.');
      return;
    }

    if (
      this.tourData.pricing_groups &&
      this.tourData.pricing_groups.length > 0
    ) {
      // console.log("Pricing Groups Exist:", this.tourData.pricing_groups);

      // Find the correct pricing group based on adultNum
      const matchedGroup = this.tourData.pricing_groups.find(
        (group: { from: number; to: number }) =>
          adultNum >= group.from && adultNum <= group.to
      );

      if (matchedGroup) {
        // console.log("Matched Pricing Group:", matchedGroup);
        this.adultPrice = matchedGroup.price;
        this.childPrice = matchedGroup.child_price;
        this.totalPrice = this.adultPrice + this.childPrice;
        // console.log("Adult Price:", matchedGroup.price);
        // console.log("Child Price:", matchedGroup.child_price);
      } else {
        // console.log('No matching pricing group found.');
        this.adultPrice = this.tourData.adult_price;
        this.childPrice = this.tourData.child_price;
        this.infantPrice = this.tourData.infant_price;
        // this.totalPrice = this.adultPrice + this.childPrice + this.infantPrice;
      }
    } else {
      // If no pricing_groups exist, return default prices
      // console.log('No Pricing Groups - Using Default Prices');
      this.adultPrice = this.tourData.adult_price;
      this.childPrice = this.tourData.child_price;
      this.infantPrice = this.tourData.infant_price;
      // this.totalPrice = this.adultPrice + this.childPrice + this.infantPrice;
    }
  }

  submitBookingForm(): void {
    if (this.bookingFormData.valid) {
      // console.log(this.bookingFormData.value);
      this._BookingService
        // ,localStorage.getItem('accessToken')
        .appendBookingData(this.bookingFormData.value)
        .subscribe({
          next: (response) => {
            // console.log(response);
            if (response.status == true) {
              // console.log(response.status);
              // console.log(this.bookingFormData.value);
              // console.log(localStorage.getItem('accessToken'));

              this.toaster.success(response.message);
              this._Router.navigate(['/cart']);
            }
          },
          error: (err) => {
            this.toaster.error(err.error.message);
          },
        });
    } else {
      this.toaster.error('Form is not valid , must choose start data');
    }
  }

  getWriteReview() {
    if (this.writeReview.valid) {
      // console.log(this.writeReview.value);
      this.isLoading = true;
      this._DataService.postReviews(this.writeReview.value).subscribe({
        next: (response) => {
          // console.log(response);
          if (response.status == true) {
            this.toaster.success(response.message);
            this.isLoading = false;
            this.writeReview.reset();
            this.getReview(); // Refresh reviews after successful submission
          }
        },
        error: (err) => {
          this.toaster.error(err.error.message || 'Error submitting review');
          this.isLoading = false;
        },
      });
    }
  }

  // check rate number <= 5 >=0
  validateRate(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);

    if (value > 5) {
      value = 5;
    } else if (value < 0) {
      value = 0;
    }

    input.value = value.toString();
    this.writeReview.get('rate')?.setValue(value);
  }

  increment(type: string) {
    let currentValue = this.bookingFormData.get(type)?.value || 0;
    if (currentValue < 12) {
      this.bookingFormData.get(type)?.setValue(currentValue + 1);
    }
  }

  decrement(type: string) {
    let currentValue = this.bookingFormData.get(type)?.value || 0;
    if (currentValue > 0) {
      this.bookingFormData.get(type)?.setValue(currentValue - 1);
    }
  }

  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        // console.log(res.data);

        const contactPhone = res.data.find(
          (item: any) => item.option_key === 'CONTACT_PHONE_NUMBER'
        );
        this.phoneNumber = contactPhone?.option_value[0];

        const contactEmail = res.data.find(
          (item: any) => item.option_key === 'email_address'
        );
        this.userEmail = contactEmail?.option_value[0];
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getFAQs(): void {
    this._DataService.getFAQs().subscribe({
      next: (response) => {
        this.faqsList = response.data.data;
        // console.log(response.data.data);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getReview(): void {
    if (this.tourData?.id) {
      this._DataService.getReviews(this.tourData.id).subscribe({
        next: (response) => {
          // console.log(response.data.data);
          this.tourReviews = response.data.data;
        },
        error: (err) => {
          console.error('Error fetching reviews:', err);
          this.tourReviews = [];
        },
      });
    }
  }

  getReviewQualityText(): string {
    const reviewCount =
      this.tourReviews.length || this.tourData?.reviews_number || 0;

    if (reviewCount === 0) {
      return 'New Tour';
    }

    // Calculate average rating from actual reviews if available
    const averageRating = this.getAverageRating();

    if (averageRating >= 4.5) {
      return 'Excellent Quality';
    } else if (averageRating >= 4.0) {
      return 'Very Good Quality';
    } else if (averageRating >= 3.5) {
      return 'Good Quality';
    } else if (averageRating >= 3.0) {
      return 'Average Quality';
    } else if (averageRating > 0) {
      return 'Below Average Quality';
    } else {
      return 'No Rating Available';
    }
  }

  getAverageRating(): number {
    if (this.tourReviews.length === 0) {
      return this.tourData?.rate || 0;
    }

    const totalRating = this.tourReviews.reduce(
      (sum, review) => sum + (review.rate || 0),
      0
    );
    return totalRating / this.tourReviews.length;
  }

  galleryOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: false,
    smartSpeed: 1500,
    margin: 20,
    items: 1,
    // responsive: {
    //   0: { },
    //   400: { items: 2 },
    //   740: { items: 3 },
    //   940: { items: 4 },
    // },
    nav: true,
    navText: [
      '<i class="fa fa-angle-double-left"></i>',
      '<i class="fa fa-angle-double-right"></i>',
    ],
  };
}
