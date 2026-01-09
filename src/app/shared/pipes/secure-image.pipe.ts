import { Pipe, PipeTransform, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Pipe({
  name: 'secureImage',
  standalone: true
})
export class SecureImagePipe implements PipeTransform {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  transform(url: string | null | undefined): Observable<string> {
    if (!url) {
      return of('');
    }

    //console.log('SecureImagePipe fetching:', url);
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map(blob => {
        const objectUrl = URL.createObjectURL(blob);
        //console.log('SecureImagePipe created blob URL:', objectUrl);
        return objectUrl;
      }),
      catchError(err => {
        //console.error('SecureImagePipe error fetching image:', url, err);
        return of('');
      })
    );
  }
}
