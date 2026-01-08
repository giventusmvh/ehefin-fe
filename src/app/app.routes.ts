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
    path: 'workplace',
    canActivate: [authGuard, roleGuard(['MARKETING', 'BRANCH_MANAGER', 'BACKOFFICE', 'SUPERADMIN'])],
    loadComponent: () => import('./features/workplace/workplace'),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['SUPERADMIN'])],
    loadChildren: () => import('./features/admin/admin.routes'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
