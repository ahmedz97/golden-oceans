import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-booknow',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './booknow.component.html',
  styleUrl: './booknow.component.scss',
})
export class BooknowComponent {}
