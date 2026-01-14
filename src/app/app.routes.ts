import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing'),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login'),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password'),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password'),
  },
  {
    path: 'workplace',
    canActivate: [authGuard, roleGuard(['MARKETING', 'BRANCH_MANAGER', 'BACKOFFICE', 'SUPERADMIN', 'ADMIN'])],
    loadComponent: () => import('./features/workplace/workplace'),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['SUPERADMIN', 'ADMIN'])],
    loadChildren: () => import('./features/admin/admin.routes'),
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./shared/components/forbidden/forbidden'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
