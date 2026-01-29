import { Component, ChangeDetectionStrategy, input, output, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../../../core/models';
import { ProductFacade } from '../product.facade';

@Component({
  selector: 'app-product-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './product-form.html',
})
export default class ProductFormComponent {
  facade = inject(ProductFacade);

  // Inputs
  isOpen = input<boolean>(false);
  product = input<Product | null>(null);

  // Outputs
  close = output<void>();
  save = output<CreateProductRequest | UpdateProductRequest>();

  // Form State
  formData: CreateProductRequest = {
    name: '',
    amount: 0,
    tenor: 1,
    interestRate: 0,
  };

  constructor() {
    // Reset form when modal opens with new/existing product
    effect(() => {
        const p = this.product();
        if (p) {
            this.formData = {
                name: p.name,
                amount: p.amount,
                tenor: p.tenor,
                interestRate: p.interestRate,
            };
        } else {
            this.formData = {
                name: '',
                amount: 0,
                tenor: 1,
                interestRate: 0,
            };
        }
    });
  }

  onSubmit() {
    this.save.emit(this.formData);
  }
}
