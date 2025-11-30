import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DestinationCartComponent } from '../../components/destination-cart/destination-cart.component';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-destination',
  standalone: true,
  imports: [
    RouterLink,
    DestinationCartComponent,
    CommonModule,
    PartnerSliderComponent,
    TranslateModule,
  ],
  templateUrl: './destination.component.html',
  styleUrl: './destination.component.scss',
})
export class DestinationComponent implements OnInit {
  constructor(private _DataService: DataService) {}
  allDestinations: any[] = [];

  ngOnInit(): void {
    this.getDestination();
  }

  getDestination() {
    this._DataService.getDestination().subscribe({
      next: (res) => {
        console.log('all destinations response:', res);
        
        if (res && res.data && res.data.data) {
          // Filter to show only sub-destinations (parent_id != null)
          const filtered = res.data.data.filter(
            (dest: any) => dest.parent_id !== null && dest.parent_id !== undefined && dest.parent_id !== 0
          );
          
          // Reverse the order of destinations
          this.allDestinations = filtered.reverse();
          
          console.log('Filtered destinations (parent_id != null):', this.allDestinations.length);
          console.log('Destinations (reversed):', this.allDestinations.map((d: any) => d.title));
        }
      },
      error: (err) => {
        console.log(err);
        this.allDestinations = [];
      },
    });
  }
}
