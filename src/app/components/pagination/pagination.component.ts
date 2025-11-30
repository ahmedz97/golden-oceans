import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, TranslateModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 15;
  @Input() totalItems: number = 0;

  @Output() pageChanged = new EventEmitter<number>();
}
