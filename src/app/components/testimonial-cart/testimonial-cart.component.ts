import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-testimonial-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-cart.component.html',
  styleUrl: './testimonial-cart.component.scss',
})
export class TestimonialCartComponent {
  @Input() testimonial: any;

  getStars(rate: number): number[] {
    const safeRate = Math.max(0, Math.min(5, Math.floor(rate || 0)));
    return Array(safeRate).fill(0);
  }
}
