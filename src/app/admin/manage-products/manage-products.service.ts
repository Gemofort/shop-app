import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { switchMap, map, tap } from 'rxjs/operators';

interface PreSignedUrlResponse {
  signedUrl: string;
}

@Injectable()
export class ManageProductsService extends ApiService {
  uploadProductsCSV(file: File): Observable<unknown> {
    if (!this.endpointEnabled('import')) {
      console.warn(
        'Endpoint "import" is disabled. To enable change your environment.ts config',
      );
      return EMPTY;
    }

    return this.getPreSignedUrl(file.name).pipe(
      tap(url => console.log('Pre-signed URL:', url, typeof url)),
      switchMap((url: string) => {
        console.log('Using URL for PUT:', url, typeof url);
        return this.http.put(url, file, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'text/csv',
          },
        });
      }),
    );
  }

  private getPreSignedUrl(fileName: string): Observable<string> {
    const url = this.getUrl('import', 'import');
    console.log("Request URL:", url);

    return this.http.get<PreSignedUrlResponse>(url, {
      params: {
        name: fileName,
      },
    }).pipe(
      tap(response => console.log('Raw response:', response)),
      map(response => {
        if (typeof response === 'string') {
          const parsed = JSON.parse(response) as PreSignedUrlResponse;
          return parsed.signedUrl;
        }
        return response.signedUrl;
      })
    );
  }
}
