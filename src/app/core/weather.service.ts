import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WeatherDto {
  "coord":{
     "lon": number,
     "lat": number
  },
  "weather":[
     {
        "id": number,
        "main":"Clear",
        "description":"clear sky",
        "icon":"01n"
     }
  ],
  "base":"stations",
  "main":{
     "temp":280.7,
     "feels_like":277.66,
     "temp_min":278.71,
     "temp_max":281.48,
     "pressure":1022,
     "humidity":54
  },
  "visibility":10000,
  "wind":{
     "speed":1.28,
     "deg":32
  },
  "clouds":{
     "all":0
  },
  "dt":1608733094,
  "sys":{
     "type":3,
     "id":2005566,
     "country":"US",
     "sunrise":1608736742,
     "sunset":1608771259
  },
  "timezone":-28800,
  "id":0,
  "name":"San Jose",
  "cod":200
}

@Injectable({ 
  providedIn: 'root'
})
export class WeatherService {
  private IP_KEY = '5a4b2d457ecbef9eb2a71e480b947604';

  constructor(private httpClient: HttpClient) { }

  getWeatherByZipCode(
    code: string,
    country: string = "us"
  ): Observable<WeatherDto> {
    const params = this.getBaseParams().set("zip", `${code},${country}`);

    return this.httpClient.get<WeatherDto>("/weather/", { params });

  }

  private getBaseParams(): HttpParams {
    return new HttpParams().set("appid", this.IP_KEY);
  }

}
