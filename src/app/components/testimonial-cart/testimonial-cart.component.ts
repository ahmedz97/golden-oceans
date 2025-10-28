import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  PLATFORM_ID,
} from '@angular/core';

@Component({
  selector: 'app-testimonial-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-cart.component.html',
  styleUrls: ['./testimonial-cart.component.scss'],
})
export class TestimonialCartComponent implements AfterViewInit {
  @Input() testimonial: any;

  getStars(rate: number): number[] {
    const safeRate = Math.max(0, Math.min(5, Math.floor(rate || 0)));
    return Array(safeRate).fill(0);
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    this.ensureElfsightLoaded();
  }

  private ensureElfsightLoaded(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const w = window as any;
    const existing = document.getElementById('elfsight-platform-script');
    if (existing) {
      // If script already present, trigger init in case this widget was added later
      try {
        w.elfsight?.apps?.init?.();
      } catch {}
      return;
    }

    const script = document.createElement('script');
    script.id = 'elfsight-platform-script';
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        w.elfsight?.apps?.init?.();
      } catch {}
    };
    document.body.appendChild(script);
  }
}
