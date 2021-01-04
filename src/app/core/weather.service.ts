import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, from, Subject } from 'rxjs';
import { LOCAL_STORAGE, StorageService, StorageDecoder, StorageEncoder } from "ngx-webstorage-service";
import { first, catchError, mergeMap, takeUntil, map, finalize } from 'rxjs/operators';
import compact from 'lodash/compact';
import { WeatherReport } from './weather.model';
import { WeatherDto } from './weather.dto';

@Injectable({ 
  providedIn: 'root'
})
export class WeatherService {
   private IP_KEY = '5a4b2d457ecbef9eb2a71e480b947604';
   private UNIT = 'imperial';
   private STORAGE_KEY = 'duyng-com-weather-app';
   private storageEncoder: StorageEncoder<string[]> = {
      encode: (keys: string[]): string => {
         return JSON.stringify(keys)
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

   private cityIds: string[] = this.storage.get(this.STORAGE_KEY, this.storageDecoder) || [];
   private weatherReports$: BehaviorSubject<WeatherReport[]> = new BehaviorSubject([]);
   private zipCodeGetError$: BehaviorSubject<string> = new BehaviorSubject('');

   constructor(
      @Inject(LOCAL_STORAGE) private storage: StorageService,
      private httpClient: HttpClient
   ) { 
      this.loadReports(this.cityIds);

      this.httpClient.get("/assets/city.list.min.json").subscribe((d) => {
         console.log(d)
      })
   }

   getWeatherByCityId(
      id: string
   ): Observable<WeatherDto> {
      const params = this.getBaseParams()
                           .set("id", id);

      return this.httpClient.get<WeatherDto>("/api/weather/", { params }).pipe(
         catchError((errRes: HttpErrorResponse) => of(errRes.error))
      );
   }

   getWeatherByLatLon(
      lat: string,
      lon: string
   ): Observable<WeatherDto> {
      const params = this.getBaseParams()
                           .set("lat", lat)
                           .set("lon", lon);

      return this.httpClient.get<WeatherDto>("/api/weather/", { params }).pipe(
         catchError((errRes: HttpErrorResponse) => of(errRes.error))
      );
   }

   getWeatherByZipCode(
      code: string,
      country: string = "us"
   ): Observable<WeatherReport> {
      const params = this.getBaseParams().set("zip", `${code},${country}`);

      return this.httpClient.get<WeatherReport>("/api/weather/", { params }).pipe(
         map( response => ({...response, zipCode: code}) ),
         catchError((errRes: HttpErrorResponse) => of(errRes.error))
      );
   }

   getForecastByZipCode(
      code: string,
      country: string = "us"
   ) {
      const params = this.getBaseParams()
                        .set("zip", `${code},${country}`)
                        .set("cnt", "5");

      return this.httpClient.get<WeatherReport>("/api/forecast/daily", { params }).pipe(
         map( response => ({...response, zipCode: code}) ),
         catchError((errRes: HttpErrorResponse) => of(errRes.error))
      );
   }

   addNewCity(cityId: string) {
      // zipCode is truthy and has not been added before
      if(cityId && this.cityIds.indexOf(cityId) === -1) {
         this.getWeatherByCityId(cityId).pipe(
            first(),
            finalize(() => this.zipCodeGetError$.next(''))
         ).subscribe((response: WeatherReport) => {
            if(response?.cod === 200) {
               const newReports = this.weatherReports$.value.concat(response)

               this.weatherReports$.next(newReports)
               this.cityIds.push(cityId);
               this.storage.set<string[]>(this.STORAGE_KEY, this.cityIds, this.storageEncoder);
            } else if (response?.cod == 404) {
               this.zipCodeGetError$.next(response.message)
            } else {
               console.error('Unknown response: ', response)
            }
         })
      } else {
         console.log('Zipcode is either invalid or already exist, doing nothing.')
      }
   }

   removeZipCode(cityId: string) {
      const currentZipcodeIndex: number = this.cityIds.indexOf(cityId);

      if(cityId && currentZipcodeIndex > -1) {
         this.cityIds.splice(currentZipcodeIndex, 1);
         this.storage.set<string[]>(this.STORAGE_KEY, this.cityIds, this.storageEncoder);

         // Filter the report matching the passed-in zipCode from the reports array
         this.weatherReports$.next(
            this.weatherReports$.value.filter((report: WeatherReport) => report.name !== cityId)
         )
      } else {
         console.log('Zipcode is not already saved, doing nothing')
      }
   }

   getWeatherReports(): Observable<WeatherReport[]> {
      return this.weatherReports$.asObservable();
   }

   getZipCodeGetError(): Observable<string> {
      return this.zipCodeGetError$.asObservable();
   }

   private loadReports(cityIds: string[]) {
      if(cityIds?.length > 0) {
         let subSubject = new Subject();

         from(cityIds).pipe(
            mergeMap((id) => this.getWeatherByCityId(id)),
            finalize(() => { subSubject.complete() }),
            takeUntil(subSubject)
         ).subscribe((report: WeatherReport) => {
            if(report?.cod === 200) {
               const indexOfResponse = cityIds.indexOf(report.zipCode);
               const newReports = [];

               // Rearrange reports to the same index as the zipCodes array
               this.weatherReports$.value.forEach((report) => {
                  newReports[cityIds.indexOf(report.zipCode)] = report
               })

               newReports[indexOfResponse] = report;

               this.weatherReports$.next(compact(newReports))
            } else if (report?.cod === 404) {
               console.error('Failed to load report for', report.zipCode)
            } else {
               console.error('Unknown response: ', report)
            }
         })
      }
   }

   private getBaseParams(): HttpParams {
      return new HttpParams()
                  .set("units", this.UNIT)
                  .set("appid", this.IP_KEY);
   }
}
