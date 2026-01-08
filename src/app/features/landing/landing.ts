import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, Product } from '../../core/models';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Navbar -->
      <nav class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
        <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span class="text-xl font-semibold text-gray-900">Ehefin</span>
          <a routerLink="/login" class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Staff Login
          </a>
        </div>
      </nav>

      <!-- Hero -->
      <section class="pt-32 pb-20 px-6">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
            Pinjaman Mudah,<br />Proses Cepat
          </h1>
          <p class="mt-6 text-lg text-gray-500 max-w-xl mx-auto">
            Ajukan pinjaman dari mana saja dengan aplikasi Ehefin. Proses approval cepat dan transparan.
          </p>
          <div class="mt-10">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20.5V3.5c0-.59.34-1.11.84-1.35l10.45 9.35-10.45 9.35c-.5-.24-.84-.76-.84-1.35zm15.54-5.09L5.71 21.51l10.82-6.08v-.02zm1.92-1.08L17.5 12l2.96-2.33c.31.18.54.5.54.88s-.23.7-.54.88zM5.71 2.49l12.83 6.1-2.96 2.33L5.71 2.49z"/>
              </svg>
              Download di Play Store
            </a>
          </div>
        </div>
      </section>

      <!-- Products -->
      <section class="py-20 px-6 bg-gray-50">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-2xl font-semibold text-gray-900 text-center mb-12">Pilihan Produk</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (product of products(); track product.id) {
              <div class="bg-white rounded-xl p-6 border border-gray-100">
                <h3 class="text-lg font-medium text-gray-900">{{ product.name }}</h3>
                <p class="mt-4 text-3xl font-semibold text-gray-900">
                  {{ formatCurrency(product.amount) }}
                </p>
                <div class="mt-4 space-y-2 text-sm text-gray-500">
                  <p>Tenor hingga {{ product.tenor }} bulan</p>
                  <p>Bunga mulai {{ product.interestRate }}%</p>
                </div>
              </div>
            } @empty {
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
                  <div class="h-5 bg-gray-200 rounded w-20"></div>
                  <div class="mt-4 h-8 bg-gray-200 rounded w-32"></div>
                  <div class="mt-4 space-y-2">
                    <div class="h-4 bg-gray-200 rounded w-24"></div>
                    <div class="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-8 px-6 border-t border-gray-100">
        <div class="max-w-6xl mx-auto text-center text-sm text-gray-400">
          © 2026 Ehefin. All rights reserved.
        </div>
      </footer>
    </div>
  `,
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
