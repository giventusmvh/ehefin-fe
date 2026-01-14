import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const platformId = inject(PLATFORM_ID);
    const authService = inject(AuthService);
    const router = inject(Router);

    // Skip role check during SSR - let client handle it after hydration
    if (!isPlatformBrowser(platformId)) {
      return true;
    }

    // DEBUG: Log roles for troubleshooting
    const userRoles = authService.roles();
    console.log('[RoleGuard] User roles:', userRoles);
    console.log('[RoleGuard] Allowed roles:', allowedRoles);
    console.log('[RoleGuard] Has any role:', authService.hasAnyRole(allowedRoles));

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    router.navigate(['/forbidden']);
    return false;
  };
}
