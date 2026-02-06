import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';
import { Product, CreateProductRequest, UpdateProductRequest, ApiResponse } from '../models';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';


describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get products', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Product 1', amount: 1000, tenor: 12, interestRate: 5 },
      { id: 2, name: 'Product 2', amount: 2000, tenor: 24, interestRate: 6 }
    ];
    const mockResponse: ApiResponse<Product[]> = { 
        data: mockProducts, 
        message: 'Success', 
        success: true,
        timestamp: '2023-01-01'
    };

    service.getProducts().subscribe(response => {
      expect(response.data?.length).toBe(2);
      expect(response.data).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get a single product', () => {
    const mockProduct: Product = { id: 1, name: 'Product 1', amount: 1000, tenor: 12, interestRate: 5 };
    const mockResponse: ApiResponse<Product> = { 
        data: mockProduct, 
        message: 'Success', 
        success: true,
        timestamp: '2023-01-01'
    };

    service.getProduct(1).subscribe(response => {
      expect(response.data).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/products/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a product', () => {
    const newProductRequest: CreateProductRequest = { name: 'New Product', amount: 3000, tenor: 36, interestRate: 7 };
    const mockProduct: Product = { id: 3, ...newProductRequest };
    const mockResponse: ApiResponse<Product> = { 
        data: mockProduct, 
        message: 'Created', 
        success: true,
        timestamp: '2023-01-01'
    };

    service.createProduct(newProductRequest).subscribe(response => {
      expect(response.data).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProductRequest);
    req.flush(mockResponse);
  });

  it('should update a product', () => {
    const updateRequest: UpdateProductRequest = { name: 'Updated Product', amount: 4000 };
    const mockProduct: Product = { id: 1, name: 'Updated Product', amount: 4000, tenor: 12, interestRate: 5 };
    const mockResponse: ApiResponse<Product> = { 
        data: mockProduct, 
        message: 'Updated', 
        success: true,
        timestamp: '2023-01-01'
    };

    service.updateProduct(1, updateRequest).subscribe(response => {
      expect(response.data?.name).toBe('Updated Product');
      expect(response.data?.amount).toBe(4000);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/products/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateRequest);
    req.flush(mockResponse);
  });

  it('should delete a product', () => {
    const mockResponse: ApiResponse<void> = { 
        data: undefined, 
        message: 'Deleted', 
        success: true,
        timestamp: '2023-01-01'
    };

    service.deleteProduct(1).subscribe(response => {
      expect(response.message).toBe('Deleted');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/products/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
