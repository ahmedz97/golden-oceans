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
import { TeamCartComponent } from '../../components/team-cart/team-cart.component';
import { BlogCartComponent } from '../../components/blog-cart/blog-cart.component';
import { BooknowComponent } from '../../components/booknow/booknow.component';
import { TestimonialCartComponent } from '../../components/testimonial-cart/testimonial-cart.component';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { AboutsectionComponent } from '../../components/aboutsection/aboutsection.component';
import { Subject, takeUntil, tap } from 'rxjs';
import { DestinationCartComponent } from '../../components/destination-cart/destination-cart.component';

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
    TeamCartComponent,
    BlogCartComponent,
    // BooknowComponent,
    // TestimonialCartComponent,
    PartnerSliderComponent,
    AboutsectionComponent,
    DestinationCartComponent,
    TestimonialCartComponent,
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
  shuffledTours: any[] = [];
  destinationPrices: DestinationPriceMap = {};
  categoryPrices: DestinationPriceMap = {};
  activeCategoryTitle: string | null = null;
  allBlogs: any[] = [];
  allReviews: any[] = [];
  activeDestinationTab: string = 'all';

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

        // Create shuffled tours for Travel Deals section
        this.createShuffledTours();

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
    // First, get page 1 to know how many pages exist
    this._DataService
      .getDestination(undefined, 1)
      .pipe(takeUntil(this.$destory))
      .subscribe({
        next: (firstPage) => {
          console.log('First page response:', firstPage);

          if (firstPage && firstPage.data) {
            const totalPages = firstPage.data.last_page || 1;
            console.log('Total pages:', totalPages);

            // If only one page, process it
            if (totalPages === 1) {
              this.processDestinations(firstPage.data.data);
            } else {
              // Fetch all remaining pages
              const pagePromises = [];
              for (let page = 2; page <= totalPages; page++) {
                pagePromises.push(
                  this._DataService
                    .getDestination(undefined, page)
                    .pipe(takeUntil(this.$destory))
                    .toPromise()
                );
              }

              Promise.all(pagePromises)
                .then((pages) => {
                  console.log('All pages fetched:', pages.length);

                  // Combine all destinations
                  let allDestinations = [...(firstPage.data.data || [])];
                  pages.forEach((page) => {
                    if (page && page.data && page.data.data) {
                      allDestinations = [...allDestinations, ...page.data.data];
                    }
                  });

                  console.log(
                    'Total destinations from all pages:',
                    allDestinations.length
                  );

                  // Process all destinations
                  this.processDestinations(allDestinations);
                })
                .catch((err) => {
                  console.error('Error fetching additional pages:', err);
                  // Just use what we have from page 1
                  this.processDestinations(firstPage.data.data);
                });
            }
          }
        },
        error: (err) => {
          console.error('Home - Error loading destinations:', err);
          this.allDestinations = [];
        },
      });
  }

  processDestinations(allDestinations: any[]) {
    console.log('=== PROCESSING DESTINATIONS ===');
    console.log('Total destinations:', allDestinations.length);

    // Filter to show only specific destinations
    const targetDestinations = ['Aswan', 'Luxor', 'Cairo', 'Alexandria'];

    const filtered = allDestinations.filter((dest: any) =>
      targetDestinations.some(
        (target) => dest.title.toLowerCase() === target.toLowerCase()
      )
    );

    console.log(
      'Filtered destinations:',
      filtered.map((d: any) => d.title)
    );

    // Store filtered destinations with placeholder images
    this.allDestinations = filtered.map((dest: any) => ({
      ...dest,
      featured_image: dest.featured_image || 'assets/image/Wallpaper/first.jpg',
    }));

    console.log(
      'Final destinations to display:',
      this.allDestinations.map((d: any) => d.title)
    );
    console.log('=== END PROCESSING ===');
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

  // Shuffle array using Fisher-Yates algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Create shuffled tours for Travel Deals section
  createShuffledTours(): void {
    if (this.alltours.length > 0) {
      // Shuffle all tours and take first 8 for display
      this.shuffledTours = this.shuffleArray(this.alltours).slice(0, 8);
      console.log('Shuffled tours for Travel Deals:', this.shuffledTours);
    }
  }

  // Set active destination tab
  setActiveDestinationTab(tab: string): void {
    this.activeDestinationTab = tab;
    // You can add filtering logic here based on the selected tab
    console.log('Active destination tab:', tab);
  }

  // owl carousel options
  mainSecOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: true,
    // navSpeed: 10000,
    margin: 20,
    items: 1,
    nav: true,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
    // autoplaySpeed: 1500,
    smartSpeed: 1500, // = navSpeed , autoplaySpeed
  };
  destinationOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: false,
    smartSpeed: 2000,
    margin: 30,
    autoplayTimeout: 4000,
    responsive: {
      0: { items: 1 },
      500: { items: 1.5 },
      600: { items: 2 },
      768: { items: 2.5 },
      992: { items: 3 },
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
