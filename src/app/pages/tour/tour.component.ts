import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
// import { TourcartComponent } from '../../components/tourcart/tourcart.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSliderModule } from '@angular/material/slider';
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
    private _ActivatedRoute: ActivatedRoute
  ) {}

  // pagination
  itemsPerPage: number = 0;
  currentPage: number = 1;
  totalItems: number = 0;

  layoutType: 'grid' | 'list' = 'grid';
  minBudget = 0;
  maxBudget = 5000;

  selectedDestination: number[] = [];
  selectedTripType: number[] = [];
  selectedDuration: number[] = [];

  allCategories: any[] = [];
  allDestinations: any[] = [];
  allDurations: any[] = [];
  allTours: any[] = [];
  filteredTours: any[] = [];

  ngOnInit(): void {
    this.getDestination();
    this.getCategories();
    this.getDurations();
    this._ActivatedRoute.queryParams.subscribe((param) => {
      // if (param) {
      //   this.getTourSearch(param);
      // } else {
      //   this.getTourPage(this.currentPage);
      // }
      console.log('params', param);

      this.selectedDestination = param['location'];
      this.selectedTripType = param['type'];
      this.selectedDuration = param['duration'];
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

  getTourSearch(params: any) {
    const query: any = {};
    // ask backend
    if (params.location) query['destination_id'] = params.location;
    if (params.type) query['category_id'] = params.type;
    if (params.duration) query['duration_in_days'] = params.duration;
    // if (params.location) query['destinations.id'] = params.location;
    // if (params.type) query['categories.id'] = params.type;
    // if (params.duration) query['duration.id'] = params.duration;
    console.log(params, query);

    this._DataService.getTours(query).subscribe({
      next: (res) => {
        // const searchTerm = params.tourName?.toLowerCase() || '';
        this.allTours = res.data.data;
        console.log(this.allTours);
        this.itemsPerPage = res.data.per_page;
        this.currentPage = res.data.current_page;
        this.totalItems = res.data.total;

        for (let i = 0; i < this.allTours.length; i++) {
          this.allTours[i].destinationsTitle = this.allTours[i].destinations
            .map((x: any) => x.title)
            .join(',');
        }

        this.filteredTours = [...this.allTours];
        console.log(this.filteredTours);
      },
      error: (err) => console.error(err),
    });
  }

  // checkbox button
  private getList(key: FilterKey): number[] {
    const list = this[key];
    return Array.isArray(list) ? list : [];
  }
  isChecked(key: FilterKey, id: number): boolean {
    return this.getList(key).includes(id);
  }

  toggle(key: FilterKey, id: number, checked: boolean) {
    const current = this.getList(key);

    if (checked) {
      if (!current.includes(id)) this[key] = [...current, id];
    } else {
      this[key] = current.filter((x) => x !== id);
    }

    this.filterTours();
  }
  // finish checkbox

  filterTours() {
    this.getTourSearch({
      location: this.selectedDestination,
      type: this.selectedTripType,
      duration: this.selectedDuration,
      price: this.maxBudget,
      page: this.currentPage,
    });

    // console.log(
    //   this.selectedDestination,
    //   this.selectedTripType,
    //   this.selectedDuration,
    //   this.minBudget,
    //   this.maxBudget,
    //   this.currentPage
    // );
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
