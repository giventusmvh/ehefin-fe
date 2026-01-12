import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorModalService } from '../../../core/services/error-modal.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (errorService.isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-scale-in">
          <div class="flex flex-col items-center text-center">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Error Occurred</h3>
            <p class="text-gray-600 mb-6 text-sm">{{ errorService.message() }}</p>
            
            <button
              (click)="errorService.close()"
              class="w-full bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              OK, I understand
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-scale-in {
      animation: scaleIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class ErrorModalComponent {
  errorService = inject(ErrorModalService);
}
