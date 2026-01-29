import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductFacade } from '../product.facade';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../../../core/models';
import ProductFormComponent from '../product-form/product-form';

@Component({
  selector: 'app-product-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, ProductFormComponent],
  templateUrl: './product-list.html',
})
export default class ProductListComponent implements OnInit {
  private facade = inject(ProductFacade);

  // Facade signals
  products = this.facade.products;
  loading = this.facade.loading;

  // Local state
  showModal = signal(false);
  editingProduct = signal<Product | null>(null);

  ngOnInit() {
    this.facade.loadProducts();
  }

  openCreateModal() {
    this.editingProduct.set(null);
    this.facade.clearError();
    this.showModal.set(true);
  }

  openEditModal(product: Product) {
    this.editingProduct.set(product);
    this.facade.clearError();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }

  async handleSave(data: CreateProductRequest | UpdateProductRequest) {
    const product = this.editingProduct();

    if (product) {
      // Update
      const result = await this.facade.updateProduct(product.id, data);
      if (result) this.closeModal();
    } else {
      // Create
      const result = await this.facade.createProduct(data as CreateProductRequest);
      if (result) this.closeModal();
    }
  }

  async deleteProduct(product: Product) {
    await this.facade.deleteProduct(product);
  }
}
