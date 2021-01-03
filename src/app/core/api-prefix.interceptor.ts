import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const webcontext =  window.location.pathname.substr(1).split('/')[0];
    const serverUrl: string = (!!webcontext) ? 
                                window.location.origin + '/' + webcontext : 
                                window.location.origin;
    
    request = request.clone({ url: serverUrl + request.url });
    return next.handle(request);
  }
}
