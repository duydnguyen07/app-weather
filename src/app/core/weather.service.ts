import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LOCAL_STORAGE, StorageService, StorageDecoder, StorageEncoder } from "ngx-webstorage-service";
import { first, catchError } from 'rxjs/operators';

export interface WeatherDto {
   cod: 404 | 200,
   message? : string,
   weather: [
      {
         id: number,
         main: string,
      }
   ],
   main: {
      temp: number,
      temp_min: number,
      temp_max: number
   },
   name: string,
}

export interface WeatherReport extends WeatherDto {
   zipcode: string
}

@Injectable({ 
  providedIn: 'root'
})
export class WeatherService {
   private IP_KEY = '5a4b2d457ecbef9eb2a71e480b947604';
   private UNIT = 'imperial';
   private STORAGE_KEY = 'weather-app';
   private storageEncoder: StorageEncoder<string[]> = {
      encode: (zipcodes: string[]): string => {
         return JSON.stringify(zipcodes)
      }
   }

   private storageDecoder: StorageDecoder<string[]> = {
      decode: (value: string): string[] => {
         try {
            return JSON.parse(value);
         } catch (e) {
            return [];
         }
      }
   }

   private zipcodes: string[] = this.storage.get(this.STORAGE_KEY, this.storageDecoder) || [];
   private weatherReports$: BehaviorSubject<WeatherReport[]> = new BehaviorSubject([]);

   constructor(
      @Inject(LOCAL_STORAGE) private storage: StorageService,
      private httpClient: HttpClient
   ) { }

   getWeatherByZipCode(
      code: string,
      country: string = "us"
   ): Observable<WeatherDto> {
      const params = this.getBaseParams().set("zip", `${code},${country}`);

      return this.httpClient.get<WeatherDto>("/weather/", { params });
   }

   addNewZipCode(zipcode: string) {
      // zipcode is truthy and has not been added before
      if(zipcode && this.zipcodes.indexOf(zipcode) === -1) {
         this.getWeatherByZipCode(zipcode).pipe(
            first(),
            catchError((errRes: HttpErrorResponse) => of(errRes.error))
         ).subscribe((response: WeatherDto) => {
            if(response?.cod === 200) {
               const newReports = this.weatherReports$.value.concat({
                  ...response,
                  zipcode
               })

               this.weatherReports$.next(newReports)
               this.zipcodes.push(zipcode);
               this.storage.set<string[]>(this.STORAGE_KEY, this.zipcodes, this.storageEncoder);
            } else if (response?.cod === 404) {
               //TODO: handle 404 error
            } else {
               console.error('Unknown response: ', response)
            }
         })
      } else {
         console.log('Zipcode is either invalid or already exist, doing nothing.')
      }
   }

   removeZipCode(zipcode: string) {
      const currentZipcodeIndex: number = this.zipcodes.indexOf(zipcode);

      if(zipcode && currentZipcodeIndex > -1) {
         this.zipcodes.splice(currentZipcodeIndex, 1);
         this.storage.set<string[]>(this.STORAGE_KEY, this.zipcodes, this.storageEncoder);
         //TODO: remove from weather reports object
      } else {
         console.log('Zipcode is not already saved, doing nothing')
      }
   }

   getWeatherReports(): Observable<WeatherReport[]> {
      return this.weatherReports$.asObservable();
   }

   private getBaseParams(): HttpParams {
      return new HttpParams()
                  .set("units", this.UNIT)
                  .set("appid", this.IP_KEY);
   }
}
