import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, Product } from '../../core/models';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './landing.html',
})
export default class LandingComponent implements OnInit {
  private http = inject(HttpClient);
  products = signal<Product[]>([]);

  ngOnInit() {
    this.loadProducts();
  }

  private loadProducts() {
    this.http.get<ApiResponse<Product[]>>(`${environment.apiUrl}/products`).subscribe({
      next: (res) => {
        if (res.data) {
          this.products.set(res.data);
        }
      },
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
