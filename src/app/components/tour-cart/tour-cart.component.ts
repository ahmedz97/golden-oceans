import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tour-cart',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './tour-cart.component.html',
  styleUrl: './tour-cart.component.scss',
})
export class TourCartComponent implements OnInit {
  @Input() layoutType: 'grid' | 'list' = 'grid';
  @Input() tour: any;

  favs: any[] = [];
  favouriteIds: number[] = [];
  alltours: any[] = [];
  tourReviews: any[] = [];

  constructor(
    private _DataService: DataService,
    private toaster: ToastrService,
    private _Router: Router
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const favs = localStorage.getItem('favouriteIds');
      this.favouriteIds = favs ? JSON.parse(favs) : [];
    } else {
      console.warn('localStorage is not available (probably SSR mode)');
    }
    
    // Fetch reviews for this tour
    if (this.tour?.id) {
      this.getTourReviews();
    }
  }

  addFav(id: number, event: Event): void {
    event.stopPropagation();
    if (!localStorage.getItem('accessToken')) {
      this.toaster.error('You must have an account');
      this._Router.navigate(['/login']);
      return;
    }
    this._DataService.toggleWishlist(id).subscribe({
      next: (response) => {
        if (localStorage.getItem('accessToken')) {
          this.favs = response;
          // toggle fav icon style (add , remove)
          const index = this.favouriteIds.indexOf(id);
          if (index > -1) {
            this.favouriteIds.splice(index, 1);
          } else {
            this.favouriteIds.push(id);
          }
          localStorage.setItem(
            'favouriteIds',
            JSON.stringify(this.favouriteIds)
          );
          // console.log(id);
          // console.log(this.favs);
          // this.toaster.success(response.message);
        } else {
          this.toaster.error('You must have an account ');
        }
      },
      error: (err) => {
        // console.log(err);
        this.toaster.error(err.error.message);
        // this._Router.navigate(['/login']);
      },
    });
  }

  getTourReviews(): void {
    if (this.tour?.id) {
      this._DataService.getReviews(this.tour.id).subscribe({
        next: (response) => {
          this.tourReviews = response.data.data || [];
        },
        error: (err) => {
          console.error('Error fetching reviews:', err);
          this.tourReviews = [];
        }
      });
    }
  }

  getAverageRating(): number {
    if (this.tourReviews.length === 0) {
      return this.tour?.rate || 0;
    }
    
    const totalRating = this.tourReviews.reduce((sum, review) => sum + (review.rate || 0), 0);
    return totalRating / this.tourReviews.length;
  }

  getReviewQualityText(): string {
    const reviewCount = this.tourReviews.length || this.tour?.reviews_number || 0;
    
    if (reviewCount === 0) {
      return 'New Tour';
    }
    
    const averageRating = this.getAverageRating();
    
    if (averageRating >= 4.5) {
      return 'Excellent';
    } else if (averageRating >= 4.0) {
      return 'Very Good';
    } else if (averageRating >= 3.5) {
      return 'Good';
    } else if (averageRating >= 3.0) {
      return 'Average';
    } else if (averageRating > 0) {
      return 'Below Average';
    } else {
      return 'No Rating';
    }
  }

  getReviewCount(): number {
    return this.tourReviews.length || this.tour?.reviews_number || 0;
  }

  getDestinationText(): string {
    if (this.tour?.destinationsTitle) {
      return this.tour.destinationsTitle;
    }
    
    if (this.tour?.destinations && Array.isArray(this.tour.destinations) && this.tour.destinations.length > 0) {
      return this.tour.destinations.map((dest: any) => dest.title).join(', ');
    }
    
    return 'Destination not specified';
  }
}
