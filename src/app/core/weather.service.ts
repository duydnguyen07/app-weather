import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, from, Subject } from 'rxjs';
import { LOCAL_STORAGE, StorageService, StorageDecoder, StorageEncoder } from "ngx-webstorage-service";
import { first, catchError, mergeMap, takeUntil, tap, finalize } from 'rxjs/operators';
import compact from 'lodash/compact';
import { WeatherDto } from './weather.dto';

@Injectable({ 
  providedIn: 'root'
})
export class WeatherService {
   private IP_KEY = '5a4b2d457ecbef9eb2a71e480b947604';
   private UNIT = 'imperial';
   private STORAGE_KEY = 'duyng-com-weather-app';
   private storageEncoder: StorageEncoder<number[]> = {
      encode: (keys: number[]): string => {
         return JSON.stringify(keys)
      }
   }

   private storageDecoder: StorageDecoder<number[]> = {
      decode: (value: string): number[] => {
         try {
            return JSON.parse(value);
         } catch (e) {
            return [];
         }
      }
   }

   private cityIds: number[] = this.storage.get(this.STORAGE_KEY, this.storageDecoder) || [];
   private weatherReports$: BehaviorSubject<WeatherDto[]> = new BehaviorSubject([]);
   private zipCodeGetError$: BehaviorSubject<string> = new BehaviorSubject('');
   private requestSuccess$: BehaviorSubject<boolean> = new BehaviorSubject(false);
   private latLonResCache = new WeakMap<{lat: string, lon: string}, WeatherDto>();

   constructor(
      @Inject(LOCAL_STORAGE) private storage: StorageService,
      private httpClient: HttpClient
   ) { 
      this.loadReports(this.cityIds);
   }

   getRequestSuccess() {
      return this.requestSuccess$.asObservable();
   }

   getWeatherByCityId(
      id: number
   ): Observable<WeatherDto> {
      const params = this.getBaseParams()
                           .set("id", id + '');

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
         tap((response) => {
            this.latLonResCache.set({lat, lon}, response)
         }),
         catchError((errRes: HttpErrorResponse) => of(errRes.error))
      );
   }

   getWeatherByZipCode(
      code: string,
      country: string = "us"
   ): Observable<WeatherDto> {
      const params = this.getBaseParams().set("zip", `${code},${country}`);

      return this.httpClient.get<WeatherDto>("/api/weather/", { params }).pipe(
         catchError((errRes: HttpErrorResponse) => of(errRes.error))
      );
   }

   getForecastByCityId(
      id: number
   ) {
      const params = this.getBaseParams()
                        .set("id", `${id}`)
                        .set("cnt", "5");

      return this.httpClient.get<WeatherDto>("/api/forecast/daily", { params }).pipe(
         catchError((errRes: HttpErrorResponse) => of(errRes.error))
      );
   }

   addNewCity(cityId: number| WeatherDto) {
      let id = (typeof cityId === "number") ? cityId : cityId['id'];

      // zipCode is truthy and has not been added before
      if(cityId && this.cityIds.indexOf(id) === -1) {
         if(typeof cityId === "number") {
            this.requestSuccess$.next(false);
            this.getWeatherByCityId(id).pipe(
               first(),
               finalize(() => {
                  this.zipCodeGetError$.next('')
               })
            ).subscribe(this.addNewCityHandler(id))
         } else {
            // Skip requesting and set the value immediately
            this.addNewCityHandler(id)(cityId);
         }
      } else {
         console.log('Zipcode is either invalid or already exist, doing nothing.')
      }
   }

   removeLocation(cityId: number) {
      const currentZipcodeIndex: number = this.cityIds.indexOf(cityId);

      if(cityId && currentZipcodeIndex > -1) {
         this.cityIds.splice(currentZipcodeIndex, 1);
         this.storage.set<number[]>(this.STORAGE_KEY, this.cityIds, this.storageEncoder);

         // Filter the report matching the passed-in zipCode from the reports array
         this.weatherReports$.next(
            this.weatherReports$.value.filter((report: WeatherDto) => report.id !== cityId)
         )
      } else {
         console.log('Zipcode is not already saved, doing nothing')
      }
   }

   getWeatherReports(): Observable<WeatherDto[]> {
      return this.weatherReports$.asObservable();
   }

   getZipCodeGetError(): Observable<string> {
      return this.zipCodeGetError$.asObservable();
   }

   private addNewCityHandler(id: number) {
      return (response: WeatherDto) => {
         if(response?.cod === 200) {
            const newReports = [...this.weatherReports$.value];
            newReports.unshift(response);

            this.weatherReports$.next(newReports)
            this.cityIds.unshift(id);
            this.storage.set<number[]>(this.STORAGE_KEY, this.cityIds, this.storageEncoder);
            this.requestSuccess$.next(true);
         } else if (response?.cod == 404) {
            this.zipCodeGetError$.next(response.message)
         } else {
            console.error('Unknown response: ', response)
         }
      }
   }

   private loadReports(cityIds: number[]) {
      if(cityIds?.length > 0) {
         let subSubject = new Subject();

         from(cityIds).pipe(
            mergeMap((id) => this.getWeatherByCityId(id)),
            finalize(() => { subSubject.complete() }),
            takeUntil(subSubject)
         ).subscribe((report: WeatherDto) => {
            if(report?.cod === 200) {

               console.log(cityIds)

               const indexOfResponse = cityIds.indexOf(report.id);
               const newReports = [];

               // Rearrange reports to the same index as the zipCodes array
               this.weatherReports$.value.forEach((report) => {
                  newReports[cityIds.indexOf(report.id)] = report
               })

               newReports[indexOfResponse] = report;

               this.weatherReports$.next(compact(newReports))
            } else if (report?.cod === 404) {
               console.error('Failed to load report for', report.id)
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
