
import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./admin-layout').then((m) => m.default),
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' as const },
      { path: 'users', loadComponent: () => import('./users/user-list').then((m) => m.default) },
      {
        path: 'users/new',
        loadComponent: () => import('./users/user-form').then((m) => m.default),
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./users/user-detail').then((m) => m.default),
      },
      { path: 'roles', loadComponent: () => import('./roles/role-list').then((m) => m.default) },
      { path: 'branches', loadComponent: () => import('./branches/branch-list').then((m) => m.default) },
      { path: 'loans', loadComponent: () => import('./loans/loan-list/loan-list').then((m) => m.default) },
      { path: 'loans/:id', loadComponent: () => import('./loans/loan-detail/loan-detail').then((m) => m.default) },
      { path: 'products', loadComponent: () => import('./products/product-list/product-list').then((m) => m.default) },
    ],
  },
] satisfies Routes;