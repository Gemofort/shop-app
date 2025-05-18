import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationService } from '../notification.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class ErrorPrintInterceptor implements HttpInterceptor {
  constructor(private readonly notificationService: NotificationService) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap({
        error: () => {
          let pathname = request.url;
          try {
            const url = new URL(request.url);
            pathname = url.pathname;
          } catch (e) {
            // If URL parsing fails, use the original URL
            console.warn('Failed to parse URL:', request.url);
          }

          this.notificationService.showError(
            `Request to "${pathname}" failed. Check the console for the details`,
            0
          );
        },
      })
    );
  }
}
