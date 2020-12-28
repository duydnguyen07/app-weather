import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, from, Subject } from 'rxjs';
import { LOCAL_STORAGE, StorageService, StorageDecoder, StorageEncoder } from "ngx-webstorage-service";
import { first, catchError, mergeMap, takeUntil, map, finalize } from 'rxjs/operators';
import compact from 'lodash/compact';
import { WeatherReport } from './weather.model';

@Injectable({ 
  providedIn: 'root'
})
export class WeatherService {
   private IP_KEY = '5a4b2d457ecbef9eb2a71e480b947604';
   private UNIT = 'imperial';
   private STORAGE_KEY = 'weather-app';
   private storageEncoder: StorageEncoder<string[]> = {
      encode: (zipCodes: string[]): string => {
         return JSON.stringify(zipCodes)
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

   private zipCodes: string[] = this.storage.get(this.STORAGE_KEY, this.storageDecoder) || [];
   private weatherReports$: BehaviorSubject<WeatherReport[]> = new BehaviorSubject([]);
   private zipCodeGetError$: BehaviorSubject<string> = new BehaviorSubject('');

   constructor(
      @Inject(LOCAL_STORAGE) private storage: StorageService,
      private httpClient: HttpClient
   ) { 
      this.loadReports(this.zipCodes)
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

   addNewZipCode(zipCode: string) {
      // zipCode is truthy and has not been added before
      if(zipCode && this.zipCodes.indexOf(zipCode) === -1) {
         this.getWeatherByZipCode(zipCode).pipe(
            first()
         ).subscribe((response: WeatherReport) => {
            if(response?.cod === 200) {
               const newReports = this.weatherReports$.value.concat(response)

               this.weatherReports$.next(newReports)
               this.zipCodes.push(zipCode);
               this.storage.set<string[]>(this.STORAGE_KEY, this.zipCodes, this.storageEncoder);
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

   removeZipCode(zipCode: string) {
      const currentZipcodeIndex: number = this.zipCodes.indexOf(zipCode);

      if(zipCode && currentZipcodeIndex > -1) {
         this.zipCodes.splice(currentZipcodeIndex, 1);
         this.storage.set<string[]>(this.STORAGE_KEY, this.zipCodes, this.storageEncoder);

         // Filter the report matching the passed-in zipCode from the reports array
         this.weatherReports$.next(
            this.weatherReports$.value.filter((report: WeatherReport) => report.zipCode !== zipCode)
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

   private loadReports(zipCodes: string[]) {
      if(zipCodes?.length > 0) {
         let subSubject = new Subject();

         from(zipCodes).pipe(
            mergeMap((zipCode) => this.getWeatherByZipCode(zipCode)),
            finalize(() => { subSubject.complete() }),
            takeUntil(subSubject)
         ).subscribe((report: WeatherReport) => {
            if(report?.cod === 200) {
               const indexOfResponse = zipCodes.indexOf(report.zipCode);
               const newReports = [];

               // Rearrange reports to the same index as the zipCodes array
               this.weatherReports$.value.forEach((report) => {
                  newReports[zipCodes.indexOf(report.zipCode)] = report
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
