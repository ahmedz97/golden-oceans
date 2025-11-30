import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaqContentComponent } from '../../components/faq-content/faq-content.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink, FaqContentComponent, CommonModule, TranslateModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {}
