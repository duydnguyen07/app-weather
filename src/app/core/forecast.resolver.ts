import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { WeatherService } from './weather.service';
import { ForecastDto } from './weather.dto';

@Injectable({
  providedIn: 'root'
})
export class ForecastResolver implements Resolve<ForecastDto> {

  constructor(private weatherService: WeatherService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ForecastDto> {
    return this.weatherService.getForecastByZipCode(route.params.zipCode)
  }
}
