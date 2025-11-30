import { Component, OnInit } from '@angular/core';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
// import { SoundComponent } from './components/sound/sound.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavComponent,
    RouterOutlet,
    FooterComponent,
    NgxSpinnerModule,
    // SoundComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'tavelo';

  constructor(public translate: TranslateService) {
    // Set default language
    translate.setDefaultLang('en');

    if (typeof window !== 'undefined') {
      const langCode = localStorage.getItem('language') || 'en';
      translate.use(langCode);
    } else {
      translate.use('en');
    }
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const langCode = localStorage.getItem('language') || 'en';
      const dir = langCode === 'ar' ? 'rtl' : 'ltr';

      // Apply lang and dir to <html>
      const htmlTag = document.documentElement;
      htmlTag.setAttribute('lang', langCode);
      htmlTag.setAttribute('dir', dir);

      // Optional: update <select> value
      const select = document.getElementById('language') as HTMLSelectElement;
      if (select) {
        select.value = langCode;
      }
    }
  }
}
