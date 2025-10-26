import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { DataService } from '../../core/services/data.service';
import { CommonModule } from '@angular/common';
import { SocialComponent } from '../../components/social/social.component';
import { TourCartComponent } from '../../components/tour-cart/tour-cart.component';
import { FaqContentComponent } from '../../components/faq-content/faq-content.component';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { BooknowComponent } from '../../components/booknow/booknow.component';

@Component({
  selector: 'app-destination-details',
  standalone: true,
  imports: [
    RouterLink,
    CarouselModule,
    CommonModule,
    SocialComponent,
    TourCartComponent,
    FaqContentComponent,
    PartnerSliderComponent,
    BooknowComponent,
  ],
  templateUrl: './destination-details.component.html',
  styleUrl: './destination-details.component.scss',
})
export class DestinationDetailsComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute
  ) {}

  destinationDetails: any = {};
  destinationSlug: any = '';
  AllDestination: any[] = [];
  tours: any[] = [];
  filteredTours: any[] = [];

  layoutType: 'grid' | 'list' = 'grid';

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next: (param) => {
        this.destinationSlug = param.get('slug');
        // console.log('Destination Slug:', this.destinationSlug);

        this._DataService.getDestinationBySlug(this.destinationSlug).subscribe({
          next: (response) => {
            this.destinationDetails = response.data;
            // console.log(this.destinationSlug);
            this.showTours(this.destinationSlug);

            console.log('destination Details:', this.destinationDetails);
          },
          error: (err) => {
            console.error('Error fetching destination details:', err);
          },
        });
      },
    });
    this.getDestinations();
    // this.showTours();
  }

  getDestinations() {
    this._DataService.getDestination().subscribe({
      next: (res) => {
        // console.log(res.data.data);
        if (res && res.data && res.data.data) {
          // Filter to show only sub-destinations (parent_id != null)
          this.AllDestination = res.data.data.filter(
            (dest: any) => dest.parent_id !== null && dest.parent_id !== undefined && dest.parent_id !== 0
          );
        }
      },
    });
  }

  // to display tours which related this destination
  showTours(desSlug: string): void {
    this._DataService.getTours().subscribe({
      next: (response) => {
        this.tours = response.data.data;
        console.log('Tours Data:', this.tours, this.tours.length);
        for (let i = 0; i < this.tours.length; i++) {
          const tour = this.tours[i];
          const tourDestinationSlugs = (tour.destinations ?? []).map((x: any) =>
            x?.slug != null ? String(x.slug).toLowerCase().trim() : ''
          );

          // check if any destination matches the slug
          if (tourDestinationSlugs.includes(desSlug.toLowerCase())) {
            this.filteredTours.push(tour);
          }
          console.log(tourDestinationSlugs, this.filteredTours, desSlug);
        }
      },
      error: (err) => {
        console.error('Error fetching tours:', err);
      },
    });
  }

  galleryOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: true,
    dots: true,
    smartSpeed: 1500,
    margin: 20,
    responsive: {
      0: { items: 1 },
      400: { items: 2 },
      740: { items: 3 },
      940: { items: 4 },
    },
    nav: false,
  };
}
