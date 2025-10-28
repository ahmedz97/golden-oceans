import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AboutsectionComponent } from '../../components/aboutsection/aboutsection.component';
import { TeamCartComponent } from '../../components/team-cart/team-cart.component';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { TestimonialCartComponent } from '../../components/testimonial-cart/testimonial-cart.component';
import { DataService } from '../../core/services/data.service';
import { BooknowComponent } from '../../components/booknow/booknow.component';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    RouterLink,
    AboutsectionComponent,
    TeamCartComponent,
    CarouselModule,
    TestimonialCartComponent,
    // BooknowComponent,
    PartnerSliderComponent,
    CommonModule,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  constructor(private _DataService: DataService) {}

  allReviews: any[] = [];

  ngOnInit(): void {
    this.getTestimonials();
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
}
