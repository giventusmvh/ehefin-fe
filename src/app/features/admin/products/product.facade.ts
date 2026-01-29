import { Injectable, inject, signal, computed } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class ProductFacade {
  private productService = inject(ProductService);
  private confirmDialog = inject(ConfirmDialogService);

  // ============ State Signals ============
  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // Search state
  readonly searchQuery = signal<string>('');

  // ============ Computed Signals ============
  readonly hasProducts = computed(() => this.products().length > 0);

  // Filtered products based on search query
  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.products();
    
    return this.products().filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.amount.toString().includes(query) ||
      product.tenor.toString().includes(query) ||
      product.interestRate.toString().includes(query)
    );
  });

  // ============ Data Loading ============

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load products');
        this.loading.set(false);
      },
    });
  }

  // ============ CRUD Operations ============

  createProduct(request: CreateProductRequest): Promise<Product | null> {
    return new Promise((resolve) => {
      this.saving.set(true);
      this.error.set(null);

      this.productService.createProduct(request).subscribe({
        next: (res) => {
          if (res.data) {
            this.products.update((list) => [...list, res.data!]);
          }
          this.saving.set(false);
          resolve(res.data ?? null);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to create product');
          this.saving.set(false);
          resolve(null);
        },
      });
    });
  }

  updateProduct(id: number, request: UpdateProductRequest): Promise<Product | null> {
    return new Promise((resolve) => {
      this.saving.set(true);
      this.error.set(null);

      this.productService.updateProduct(id, request).subscribe({
        next: (res) => {
          if (res.data) {
            this.updateProductInList(res.data);
          }
          this.saving.set(false);
          resolve(res.data ?? null);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update product');
          this.saving.set(false);
          resolve(null);
        },
      });
    });
  }

  async deleteProduct(product: Product): Promise<boolean> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return false;

    return new Promise((resolve) => {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.products.update((list) => list.filter((p) => p.id !== product.id));
          resolve(true);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to delete product');
          resolve(false);
        },
      });
    });
  }

  // ============ Helpers ============

  private updateProductInList(updatedProduct: Product): void {
    const updatedList = this.products().map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    this.products.set(updatedList);
  }

  clearError(): void {
    this.error.set(null);
  }
}
