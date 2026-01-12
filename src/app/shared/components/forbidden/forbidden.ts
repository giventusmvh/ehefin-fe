import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div class="max-w-md w-full text-center">
        <h1 class="text-9xl font-bold text-gray-200">403</h1>
        <h2 class="text-2xl font-semibold text-gray-900 mt-4">Access Denied</h2>
        <p class="text-gray-600 mt-2 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <a routerLink="/" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors">
          Go Back Home
        </a>
      </div>
    </div>
  `,
})
export default class ForbiddenComponent {}
