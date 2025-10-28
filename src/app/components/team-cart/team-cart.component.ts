import { Component } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-team-cart',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './team-cart.component.html',
  styleUrl: './team-cart.component.scss',
})
export class TeamCartComponent {
  teamData: any[] = [
    {
      name: 'Ahmed Abou El Dahab',
      jobTitle: 'CEO',
      src: './assets/image/golden ocean/1.jpeg',
    },
    {
      name: 'Amira Elzayat',
      jobTitle: 'Head of Marketing ',
      src: './assets/image/golden ocean/2.jpeg',
    },
    {
      name: 'Osama Adly',
      jobTitle: 'operation manager',
      src: './assets/image/golden ocean/3.jpeg',
    },
    {
      name: 'Hanan Yehia',
      jobTitle: 'reservation manager',
      src: './assets/image/golden ocean/4.jpeg',
    },
    {
      name: 'Moataz Mohamed Abou Dahab',
      jobTitle: 'account manager',
      src: './assets/image/golden ocean/5.jpeg',
    },
  ];

  destinationOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    autoplay: false,
    dots: false,
    smartSpeed: 2000,
    margin: 30,
    autoplayTimeout: 4000,
    responsive: {
      0: { items: 1 },
      500: { items: 1.5 },
      600: { items: 2.5 },
      768: { items: 3.5 },
      992: { items: 4 },
    },
    nav: true,
    navText: [
      '<i class="fa fa-angle-double-left"></i>',
      '<i class="fa fa-angle-double-right"></i>',
    ],
  };
}
