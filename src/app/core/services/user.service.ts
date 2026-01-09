import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  /**
   * Get user by ID (Staff endpoint)
   * Accessible by: SUPERADMIN, MARKETING, BRANCH_MANAGER, BACKOFFICE
   */
  getUser(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiUrl}/users/${id}`);
  }
}
