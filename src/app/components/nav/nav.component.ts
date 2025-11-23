import {
  Component,
  HostListener,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent implements OnInit {
  constructor(
    private _DataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  navigationLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/blog', label: 'Blogs' },
    { path: '/contact', label: 'Contact' },
  ];

  isSidebarOpen = false;
  allDestinations: any[] = [];
  allCategories: any[] = [];
  egyptCategories: any[] = [];

  isHovered = false;
  logo: any;
  phoneNunmber: any;
  siteTitle: any;

  // -------- start scroll code
  scrolled = false;

  @HostListener('window:scroll', [])
  onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    this.scrolled = y > 50;
  }

  // -------- end scroll code

  categoriesByDest: Record<string, any[]> = {};

  ngOnInit(): void {
    this.getDestination();
    this.getSettings();
    this.getCategories();
    this.getEgyptCategory();
  }

  isEgypt(dest: any) {
    return dest?.title?.trim().toLowerCase() === 'egypt';
  }

  onLangChange(event: Event): void {
    const langCode = (event.target as HTMLSelectElement).value;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', langCode);
      const dir = langCode === 'ar' ? 'rtl' : 'ltr';

      const htmlTag = document.documentElement;
      htmlTag.setAttribute('lang', langCode);
      htmlTag.setAttribute('dir', dir);

      // Reload to apply translation changes
      location.reload();
    }
  }

  applyLanguageSettings(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const langCode = localStorage.getItem('language') || 'en';
    const dir = langCode === 'ar' ? 'rtl' : 'ltr';

    document.documentElement.setAttribute('lang', langCode);
    document.documentElement.setAttribute('dir', dir);

    const select = document.getElementById('language') as HTMLSelectElement;
    if (select) select.value = langCode;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    document.body.style.overflow = '';
  }

  getDestination() {
    this._DataService.getDestination().subscribe({
      next: (res) => {
        console.log(res.data.data);
        this.allDestinations = res.data.data;
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getCategories() {
    this._DataService.getCategories().subscribe({
      next: (res) => {
        this.allCategories = res.data.data;
        console.log('all categories', this.allCategories);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        console.log(res.data);

        const contactLogo = res.data.find(
          (item: any) => item.option_key === 'logo'
        );
        this.logo = contactLogo?.option_value[0];

        const contactPhone = res.data.find(
          (item: any) => item.option_key === 'CONTACT_PHONE_NUMBER'
        );
        this.phoneNunmber = contactPhone?.option_value[0];

        const title = res.data.find(
          (item: any) => item.option_key === 'site_title'
        );
        this.siteTitle = title?.option_value[0];

        // console.log(this.logo);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  getEgyptCategory(): void {
    this._DataService.getTours({ destination_title: 'egypt' }).subscribe({
      next: (res) => {
        console.log(res.data.categories);
        this.egyptCategories = res.data.categories;
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }
}
