import { Pipe, PipeTransform, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Pipe to securely load images with authentication
 * Usage: {{ imageUrl | secureImage | async }}
 */
@Pipe({
  name: 'secureImage',
  standalone: true,
})
export class SecureImagePipe implements PipeTransform {
  private http = inject(HttpClient);

  transform(url: string | null | undefined): Observable<string> {
    if (!url) {
      return of('');
    }

    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((blob) => URL.createObjectURL(blob)),
      catchError(() => of(''))
    );
  }
}

