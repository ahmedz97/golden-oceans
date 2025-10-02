import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogCartComponent } from '../../components/blog-cart/blog-cart.component';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    RouterLink,
    BlogCartComponent,
    CommonModule,
    PaginationComponent,
    NgxPaginationModule,
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent {
  allBlogs: any[] = [];

  // pagination
  itemsPerPage: number = 6;
  currentPage: number = 1;
  totalItems: number = 0;

  // onBlogsLoaded(blogs: any[]) {
  //   this.allBlogs = blogs;
  // }

  constructor(private data: DataService) {}

  ngOnInit(): void {
    this.data.getBlogs().subscribe({
      next: (res) => {
        this.allBlogs = res?.data?.data ?? res ?? [];
        this.totalItems = this.allBlogs.length; // client-side pagination
      },
      error: (err) => console.log(err),
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
