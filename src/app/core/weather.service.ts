import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WeatherDto } from './weather.model';

@Injectable({ 
  providedIn: 'root'
})
export class WeatherService {
  private IP_KEY = '5a4b2d457ecbef9eb2a71e480b947604';

  constructor(private httpClient: HttpClient) { }

  getWeatherByZipCode(code: string, country?: string) {
    // const params = new HttpParams().set();

    this.httpClient.get<WeatherDto>('/weather')
  }

}
