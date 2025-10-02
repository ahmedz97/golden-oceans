import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-partner-slider',
  standalone: true,
  imports: [CarouselModule, CommonModule],
  templateUrl: './partner-slider.component.html',
  styleUrl: './partner-slider.component.scss',
})
export class PartnerSliderComponent {
  partnerImg: any[] = [
    { src: '../../../assets/image/partner/civitatis.webp' },
    { src: '../../../assets/image/partner/partner.webp' },
    { src: '../../../assets/image/partner/partner1.webp' },
    { src: '../../../assets/image/partner/partner12.webp' },
    { src: '../../../assets/image/partner/partner2.webp' },
    { src: '../../../assets/image/partner/partner3.webp' },
    { src: '../../../assets/image/partner/partner4.webp' },
    { src: '../../../assets/image/partner/partner5.webp' },
    { src: '../../../assets/image/partner/partner6.webp' },
    { src: '../../../assets/image/partner/partner7.webp' },
    { src: '../../../assets/image/partner/partner8.webp' },
    { src: '../../../assets/image/partner/partner9.webp' },
    { src: '../../../assets/image/partner/partner99.webp' },
    { src: '../../../assets/image/partner/tourradar.webp' },
    { src: '../../../assets/image/partner/viator.webp' },
  ];

  partnersOptions: OwlOptions = {
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
      586: { items: 2 },
      767: { items: 3 },
      992: { items: 4 },
      1200: { items: 6 },
    },
    nav: false,
    navText: [
      '<i class="fa fa-angle-double-left"></i>',
      '<i class="fa fa-angle-double-right"></i>',
    ],
  };
}
