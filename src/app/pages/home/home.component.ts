import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { DataService } from '../../core/services/data.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TourCartComponent } from '../../components/tour-cart/tour-cart.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DestinationCartComponent } from '../../components/destination-cart/destination-cart.component';
import { TeamCartComponent } from '../../components/team-cart/team-cart.component';
import { BlogCartComponent } from '../../components/blog-cart/blog-cart.component';
import { BooknowComponent } from '../../components/booknow/booknow.component';
import { TestimonialCartComponent } from '../../components/testimonial-cart/testimonial-cart.component';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { AboutsectionComponent } from '../../components/aboutsection/aboutsection.component';
import { Subject, takeUntil, tap } from 'rxjs';

interface DestinationPriceMap {
  [title: string]: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CarouselModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TourCartComponent,
    DestinationCartComponent,
    TeamCartComponent,
    BlogCartComponent,
    BooknowComponent,
    TestimonialCartComponent,
    PartnerSliderComponent,
    AboutsectionComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private $destory = new Subject<void>();
  constructor(
    private _DataService: DataService,
    private _Router: Router,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.rawVideoUrl
    );
    this.isBrowser = isPlatformBrowser(platformId);
  }

  searchForm!: FormGroup;
  allDestinations: any[] = [];
  allCategories: any[] = [];
  allDurations: any[] = [];
  alltours: any[] = [];
  destinationPrices: DestinationPriceMap = {};
  categoryPrices: DestinationPriceMap = {};
  activeCategoryTitle: string | null = null;
  allBlogs: any[] = [];
  allReviews: any[] = [];

  mainSecSlider: any[] = [
    { src: '../../../assets/image/Wallpaper/first.jpg' },
    { src: '../../../assets/image/Wallpaper/Islamic.jpg' },
    { src: '../../../assets/image/Wallpaper/Pyramids.jpg' },
    { src: '../../../assets/image/Wallpaper/Temple.jpg' },
  ];

  // video
  rawVideoUrl = 'https://www.youtube.com/embed/k3KqP69xuPc?si=jlt_SSYpm0STHo7I';
  posterSrc = '../../../assets/images/blog2.jpg';
  sanitizedVideoUrl: SafeResourceUrl | null = null;
  isVideoPlaying = false;
  isBrowser = false;

  ngOnInit(): void {
    this.getDestination();
    this.getCategory();
    this.getDurations();
    this.getTours();
    this.getTestimonials();
    this.searchForm = new FormGroup({
      location: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      duration: new FormControl(''),
    });
  }

  onSubmit() {
    const formData = {
      ...this.searchForm.value,
    };

    // navigate to tour List
    this._Router.navigate(['/tour'], {
      queryParams: formData,
    });
  }

  getTours(categoryTitle?: string) {
    this.activeCategoryTitle = categoryTitle ?? null;
    this._DataService.getTours().subscribe({
      next: (res) => {
        this.alltours = res.data.data;
        const normalize = (s?: string) => (s ?? '').trim().toLowerCase();
        const filtered = categoryTitle
          ? this.alltours.filter(
              (tour: any) =>
                Array.isArray(tour.categories) &&
                tour.categories.some(
                  (c: any) => normalize(c.title) === normalize(categoryTitle)
                )
            )
          : this.alltours;

        this.alltours = filtered;

        // get lowest price for destinations and categories
        this.destinationPrices = {};
        this.categoryPrices = {};

        for (const tour of filtered) {
          const price = Number(tour.start_from) || 0;

          (tour.destinations || []).forEach((dest: any) => {
            if (
              this.destinationPrices[dest.title] == null ||
              price < this.destinationPrices[dest.title]
            ) {
              this.destinationPrices[dest.title] = price;
            }
          });

          (tour.categories || []).forEach((cat: any) => {
            if (
              this.categoryPrices[cat.title] == null ||
              price < this.categoryPrices[cat.title]
            ) {
              this.categoryPrices[cat.title] = price;
            }
          });
        }
        console.log(this.alltours);
        console.log(this.destinationPrices);
        console.log(this.categoryPrices);
        // this.getDestination();
        // this.getCategory();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // getDestination() {
  //   this._DataService.getDestination().subscribe({
  //     next: (res) => {
  //       const pricesMap = this.destinationPrices; // مثل { Egypt: 80, Alexandria: 100, Luxor: 100 }
  //       console.log(this.destinationPrices);
  //       console.log(res, 'home page');

  //       this.allDestinations = res.data.data.map((dest: any) => {
  //         const destTitle = dest.title.trim().toLowerCase();
  //         let matched = false;

  //         for (const key in pricesMap) {
  //           const priceTitle = key.trim().toLowerCase();

  //           if (destTitle === priceTitle) {
  //             dest.start_price = pricesMap[key];
  //             matched = true;
  //             break;
  //           }
  //         }

  //         if (!matched) {
  //           dest.start_price = pricesMap['Egypt']; // fallback to Egypt price
  //         }

  //         return dest;
  //       });

  //       console.log('all destinations with start price', this.allDestinations);
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     },
  //   });
  // }

  ngOnDestroy(): void {
    this.$destory.next();
    this.$destory.complete();
  }

  getDestination() {
    this._DataService
      .getDestination()
      .pipe(
        takeUntil(this.$destory), // close , clear suscripe memory on destroy
        tap((res) => {
          if (res) {
            // console.log('home page -- ', res);
            this.allDestinations = res.data.data;
          }
        })
      )
      .subscribe();
  }

  getCategory() {
    this._DataService.getCategories().subscribe({
      next: (res) => {
        console.log(res.data.data);

        const pricesMap = this.categoryPrices; // مثل { Multi Days Tours: 80, Egypt Classic Tours: 100, Nile Cruises: 150 , Adventure Tours: 80,Culture Tours: 80 }
        console.log(pricesMap);

        this.allCategories = res.data.data.map((cat: any) => {
          const categoryTitle = cat.title.trim().toLowerCase();
          let matched = false;

          for (const key in pricesMap) {
            const priceTitle = key.trim().toLowerCase();
            // console.log(priceTitle, categoryTitle);

            if (categoryTitle === priceTitle) {
              cat.start_price = pricesMap[key];
              matched = true;
              break;
            }
          }

          if (!matched) {
            cat.start_price = pricesMap['Nile Cruises']; // fallback to Nile Cruises price
            console.log('not matched');
          }

          return cat;
        });

        console.log('all categories with start price', this.allCategories);
      },
    });
  }

  getDurations() {
    this._DataService
      .getToursDuration()
      .pipe(
        takeUntil(this.$destory), // close , clear suscripe memory on destroy
        tap((res) => {
          this.allDurations = res.data;
          console.log(this.allDurations);
        })
      )
      .subscribe({
        next: (res) => {
          // console.log(res.data);
        },
        error: (err) => {
          // console.log(err);
        },
      });
  }

  // testimonial
  getTestimonials() {
    this._DataService.getReviews().subscribe({
      next: (res) => {
        this.allReviews = res.data.data;
        console.log(this.allReviews);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onBlogsLoaded(blogs: any[]) {
    this.allBlogs = blogs;
  }

  // video controls
  openVideo() {
    this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.rawVideoUrl
    );
    this.isVideoPlaying = true;
  }
  closeVideo() {
    this.sanitizedVideoUrl = null;
    this.isVideoPlaying = false;
  }

  // rate star
  getStars(rate: number): boolean[] {
    const safeRate = Math.max(0, Math.min(5, Math.floor(rate || 0)));
    return Array.from({ length: 5 }, (_, i) => i < safeRate);
  }

  // owl carousel options
  mainSecOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: false,
    // navSpeed: 10000,
    margin: 20,
    items: 1,
    nav: false,
    // autoplaySpeed: 1500,
    smartSpeed: 1500, // = navSpeed , autoplaySpeed
  };
  destinationOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: true,
    smartSpeed: 1500,
    margin: 10,
    responsive: {
      0: { items: 1 },
      767: { items: 2 },
      992: { items: 3 },
      1200: { items: 4 },
    },
    nav: true,
    navText: [
      '<i class="fa fa-angle-double-left"></i>',
      '<i class="fa fa-angle-double-right"></i>',
    ],
  };
  testimonialOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: false,
    smartSpeed: 1500,
    margin: 30,
    responsive: {
      0: { items: 1 },
      992: { items: 2 },
    },
    nav: true,
    navText: [
      '<i class="fa fa-angle-double-left"></i>',
      '<i class="fa fa-angle-double-right"></i>',
    ],
  };
  tourOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: false,
    navSpeed: 2500,
    margin: 20,
    items: 1,
    nav: true,
    navText: [
      '<i class="fa fa-angle-double-left"></i>',
      '<i class="fa fa-angle-double-right"></i>',
    ],
  };
}
