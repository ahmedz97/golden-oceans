import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { DataService } from '../../core/services/data.service';
@Component({
  selector: 'app-faq-content',
  standalone: true,
  imports: [MatExpansionModule, CommonModule],
  templateUrl: './faq-content.component.html',
  styleUrl: './faq-content.component.scss',
})
export class FaqContentComponent implements OnInit {
  constructor(private _DataService: DataService) {}
  panelOpenState = false;
  faqs: any[] = [];

  ngOnInit(): void {
    this.getFAQ();
  }
  getFAQ() {
    this._DataService.getFAQs().subscribe({
      next: (res) => {
        // console.log(res.data.data);
        this.faqs = res.data.data;
      },
    });
  }
}
