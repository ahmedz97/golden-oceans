import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { TourcartComponent } from '../../components/tourcart/tourcart.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { DataService } from '../../core/services/data.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { TourCartComponent } from '../../components/tour-cart/tour-cart.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';

type FilterKey =
  | 'selectedTripType'
  | 'selectedDuration'
  | 'selectedDestination';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatSliderModule,
    MatExpansionModule,
    NgxPaginationModule,
    TourCartComponent,
    PaginationComponent,
    TranslateModule,
  ],
  templateUrl: './tour.component.html',
  styleUrl: './tour.component.scss',
})
export class TourComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router
  ) {}

  // pagination
  itemsPerPage: number = 0;
  currentPage: number = 1;
  totalItems: number = 0;

  layoutType: 'grid' | 'list' = 'grid';
  minBudget = 0;
  maxBudget = 5000;

  selectedDestination: string | number | null = null;
  selectedTripType: string | number | null = null;
  selectedDuration: string | number | null = null;

  allCategories: any[] = [];
  allDestinations: any[] = [];
  allDurations: any[] = [];
  allTours: any[] = [];
  filteredTours: any[] = [];

  private isUpdatingUrl = false;

  ngOnInit(): void {
    this.getDestination();
    this.getCategories();
    this.getDurations();
    this._ActivatedRoute.queryParams.subscribe((param) => {
      console.log('params', param);

      // Skip if we're updating URL internally to prevent loop
      if (this.isUpdatingUrl) {
        return;
      }

      // Handle slugs from query params
      if (param['type']) {
        const typeParam = param['type'];
        this.selectedTripType = Array.isArray(typeParam)
          ? typeParam[0]
          : typeParam;
      } else {
        this.selectedTripType = null;
      }

      if (param['location']) {
        const locationParam = param['location'];
        this.selectedDestination = Array.isArray(locationParam)
          ? locationParam[0]
          : locationParam;
      } else {
        this.selectedDestination = null;
      }

      if (param['duration']) {
        const durationParam = param['duration'];
        this.selectedDuration = Array.isArray(durationParam)
          ? durationParam[0]
          : durationParam;
      } else {
        this.selectedDuration = null;
      }

      this.filterTours();
    });
  }

  getDestination() {
    this._DataService.getDestination().subscribe({
      next: (res) => (this.allDestinations = res.data.data),
      // error: (err) => console.log(err),
    });
  }

  getCategories() {
    this._DataService.getCategories().subscribe({
      next: (res) => (this.allCategories = res.data.data),
      // error: (err) => console.log(err),
    });
  }

  getDurations() {
    this._DataService.getToursDuration().subscribe({
      next: (res) => {
        this.allDurations = res.data;
        // console.log(this.allDurations);
      },
      // error: (err) => console.log(err),
    });
  }

  // Helper method to convert slugs to IDs
  private convertSlugToId(slug: string | number, items: any[]): number | null {
    if (typeof slug === 'number') {
      return slug;
    }
    const item = items.find((item) => item.slug === slug);
    return item ? item.id : null;
  }

  // Helper method to convert IDs to slugs
  private convertIdToSlug(
    id: string | number,
    items: any[]
  ): string | number | null {
    if (typeof id === 'string' && !/^\d+$/.test(id)) {
      // Already a slug (string that's not all digits)
      return id;
    }
    const numericId = typeof id === 'number' ? id : parseInt(id, 10);
    const item = items.find((item) => item.id === numericId);
    return item ? item.slug || item.id : null;
  }

  // Helper method to convert array of slugs to IDs
  private convertSlugsToIds(
    slugs: (string | number)[],
    items: any[]
  ): number[] {
    return slugs
      .map((slug) => this.convertSlugToId(slug, items))
      .filter((id): id is number => id !== null);
  }

  getTourSearch(params: any) {
    const query: any = {};

    // Convert slugs to IDs for API calls
    if (params.location && params.location.length > 0) {
      const destinationIds = this.convertSlugsToIds(
        Array.isArray(params.location) ? params.location : [params.location],
        this.allDestinations
      );
      if (destinationIds.length > 0) {
        query['destination_id'] = destinationIds;
      }
    }

    if (params.type && params.type.length > 0) {
      const categoryIds = this.convertSlugsToIds(
        Array.isArray(params.type) ? params.type : [params.type],
        this.allCategories
      );
      if (categoryIds.length > 0) {
        query['category_id'] = categoryIds;
      }
    }

    if (params.duration && params.duration.length > 0) {
      query['duration_in_days'] = Array.isArray(params.duration)
        ? params.duration
        : [params.duration];
    }

    // if (params.price) {
    //   query['price'] = params.price;
    // }

    if (params.page) {
      query['page'] = params.page;
    }

    console.log('Search params:', params, 'Query:', query);

    this._DataService
      .getTours(query, params.page || this.currentPage)
      .subscribe({
        next: (res) => {
          this.allTours = res.data.data;
          console.log('Tours:', this.allTours);
          this.itemsPerPage = res.data.per_page;
          this.currentPage = res.data.current_page;
          this.totalItems = res.data.total;

          for (let i = 0; i < this.allTours.length; i++) {
            this.allTours[i].destinationsTitle = this.allTours[i].destinations
              .map((x: any) => x.title)
              .join(',');
          }

          this.filteredTours = [...this.allTours];
          console.log('Filtered tours:', this.filteredTours);
        },
        error: (err) => console.error(err),
      });
  }

  // radio button
  onRadioChange(key: FilterKey, event: any) {
    const value = event.value;
    this[key] = value;
    this.filterTours();
  }

  // Clear individual filter
  clearFilter(key: FilterKey, event: Event) {
    event.stopPropagation(); // Prevent panel from expanding/collapsing
    this[key] = null;
    this.filterTours();
  }

  // Clear price filter
  clearPriceFilter(event: Event) {
    event.stopPropagation();
    this.minBudget = 0;
    this.maxBudget = 5000;
    this.filterTours();
  }

  // Clear all filters
  clearAllFilters(event: Event) {
    event.stopPropagation();
    this.selectedTripType = null;
    this.selectedDestination = null;
    this.selectedDuration = null;
    this.minBudget = 0;
    this.maxBudget = 5000;
    this.currentPage = 1;
    this.filterTours();
  }
  // finish radio button

  filterTours() {
    // Build query params with slugs (convert IDs to slugs if needed)
    const queryParams: any = {};

    if (this.selectedDestination) {
      const slug = this.convertIdToSlug(
        this.selectedDestination,
        this.allDestinations
      );
      if (slug) {
        queryParams['location'] = slug;
      }
    }

    if (this.selectedTripType) {
      const slug = this.convertIdToSlug(
        this.selectedTripType,
        this.allCategories
      );
      if (slug) {
        queryParams['type'] = slug;
      }
    }

    if (this.selectedDuration) {
      // Duration might not have slugs, so use as-is or convert if needed
      const slug = this.convertIdToSlug(
        this.selectedDuration,
        this.allDurations
      );
      if (slug) {
        queryParams['duration'] = slug;
      } else if (this.selectedDuration) {
        queryParams['duration'] = this.selectedDuration;
      }
    }

    if (this.currentPage > 1) {
      queryParams['page'] = this.currentPage;
    }

    // Set flag to prevent queryParams subscription from triggering
    this.isUpdatingUrl = true;

    // Update URL with slugs
    this._Router
      .navigate([], {
        relativeTo: this._ActivatedRoute,
        queryParams: queryParams,
        queryParamsHandling: 'merge',
      })
      .then(() => {
        // Reset flag after navigation completes
        setTimeout(() => {
          this.isUpdatingUrl = false;
        }, 0);
      });

    // Convert slugs to IDs for API call
    this.getTourSearch({
      location: this.selectedDestination ? [this.selectedDestination] : [],
      type: this.selectedTripType ? [this.selectedTripType] : [],
      duration: this.selectedDuration ? [this.selectedDuration] : [],
      price: this.maxBudget,
      page: this.currentPage,
    });
  }

  setLayout(type: 'grid' | 'list') {
    this.layoutType = type;
  }

  getTourPage(page: number): void {
    this._DataService.getTourPagination(page).subscribe({
      next: (res) => {
        this.allTours = res.data.data;
        this.totalItems = res.data.total;
        this.currentPage = page;
        // console.log(this.itemsPerPage, this.totalItems, this.currentPage);
        // console.log(res.data);

        this.allTours.forEach((tour) => {
          tour.destinationsTitle = tour.destinations
            ?.map((x: any) => x.title)
            .join(', ');
        });
        this.filteredTours = [...this.allTours];
      },
      error: (err) => console.error(err),
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    // console.log(page);
    this.filterTours();
  }

  onSortChange(event: Event) {
    const sortBy = (event.target as HTMLSelectElement).value;

    switch (sortBy) {
      case 'recent':
        this.sortByRecent();
        break;
      // to do best seller , you must have property to check number of seller si 'sales_count'
      // i use display_order [true or false]
      case 'bestseller':
        this.sortByBestSeller();
        break;
      case 'priceLowToHigh':
        this.sortByPriceAsc();
        break;
      case 'priceHighToLow':
        this.sortByPriceDesc();
        break;
      default:
        break;
    }
  }

  sortByBestSeller() {
    this.filteredTours = [...this.allTours].sort(
      (a, b) => b.display_order - a.display_order
    );
    // console.log(this.filteredTours);
  }

  sortByRecent() {
    this.filteredTours = [...this.allTours].sort((a, b) => b.id - a.id);
    // console.log(this.filteredTours);
  }

  sortByPriceAsc() {
    this.filteredTours = [...this.allTours].sort(
      (a, b) => a.start_from - b.start_from
    );
    // console.log(this.filteredTours);
  }

  sortByPriceDesc() {
    this.filteredTours = [...this.allTours].sort(
      (a, b) => b.start_from - a.start_from
    );
    // console.log(this.filteredTours);
  }
}
