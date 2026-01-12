import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ErrorModalService } from '../services/error-modal.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const errorService = inject(ErrorModalService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized - Redirect to login (handled by existing code, but good to be explicit)
      if (error.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        router.navigate(['/login']);
        return throwError(() => error);
      }

      // 403 Forbidden - Redirect to forbidden page
      if (error.status === 403) {
        router.navigate(['/forbidden']);
        return throwError(() => error);
      }

      // 404 Not Found - Optional: could redirect or show modal. Let's show modal for API 404s.
      // Other errors (500, 400, etc.) - Show Error Modal
      
      // Don't show modal for 401/403 as they are handled above
      // Also potentially check if it's a blob request or something that shouldn't show modal
      
      let message = 'An unexpected error occurred. Please try again.';
      if (error.error?.message) {
        message = error.error.message;
      } else if (typeof error.error === 'string') {
        message = error.error;
      } else if (error.message) {
        message = error.message;
      }
      
      // Prevent showing modal for 401/403 if they fell through (though they shouldn't)
      if (error.status !== 401 && error.status !== 403) {
        errorService.show(message);
      }

      return throwError(() => error);
    })
  );
};
