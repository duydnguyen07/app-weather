import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { first, catchError, mergeMap, takeUntil, map, finalize } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import * as fuzzysort  from 'fuzzysort';

export interface City {
  id: number; 
  name: string;
  state: string;
  country: string;
  coord: {
    lon: number, 
    lat: number
  }
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private cityList$: BehaviorSubject<City[]> = new BehaviorSubject([]);

  constructor(private httpClient: HttpClient) { 
    // Fetch the city list and push it to the subject
    this.httpClient.get("/assets/city.list.min.json").pipe(first()).subscribe((d: City[]) => this.cityList$.next(d))
  }

  getSuggestions(text: string): Fuzzysort.KeyResults<City> {
    return fuzzysort.go<City>(text, this.cityList$.value, {key: "name"})
  }
}
