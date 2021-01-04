import { Component, OnInit, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { WeatherService } from '../core/weather.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, first, finalize } from 'rxjs/operators';
import { HomeService, City } from './home.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { WeatherDto } from '../core/weather.dto';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit {
  cityControl: FormControl = new FormControl('', [Validators.required]);
  weatherReports$: Observable<WeatherDto[]> = this.weatherService.getWeatherReports();
  zipCodeGetError$: Observable<string> = this.weatherService.getZipCodeGetError();
  typeAheadSuggestions$: Observable<Fuzzysort.KeyResult<City>[]> = new BehaviorSubject([])
  requestSuccess$: Observable<boolean> = this.weatherService.getRequestSuccess();
  addingCurrentLocation$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  currentMatch: TypeaheadMatch;

  constructor(
    private weatherService: WeatherService,
    private homeService: HomeService
  ) { }

  ngOnInit() {
    this.typeAheadSuggestions$ = of(this.cityControl.value).pipe(
      map(() => {
        let data = this.homeService.getSuggestions(this.cityControl.value)
        let trimmedResult:  Fuzzysort.KeyResult<City>[] = [];

        for(let i = 0; i < 10 && i < data.total; i++) {
          trimmedResult[i] = data[i];
        }
        return trimmedResult
      })
    )

    this.requestSuccess$.subscribe((isSuccess: boolean) => {
      if(isSuccess) {
        this.currentMatch = null;
        this.cityControl.reset();
      }
    })
  }

  ngAfterViewInit() {
  }

  addCurrentLocation() {
    this.addingCurrentLocation$.next(true)
    this.getLocation((lat, lon) => {
      this.weatherService.getWeatherByLatLon(lat, lon).pipe(
        first(),
        finalize(() => { 
          this.addingCurrentLocation$.next(false) 
        })
      ).subscribe((report: WeatherDto) => {
        // Set value of control if user has not filled it out yet
        if(!this.cityControl.value) {
          this.currentMatch = new TypeaheadMatch({obj: report}, '');
          this.weatherService.addNewCity(report)
        }
      })
    });
  }

  deleteCity(id: number) {
    this.weatherService.removeLocation(id);
  }

  addLocation() {
    if(!!this.currentMatch) {
      this.weatherService.addNewCity(this.currentMatch.item.obj.id)
    }
  }

  setLocationAndFetch(match: TypeaheadMatch) {
    this.currentMatch = match;
    this.weatherService.addNewCity(match.item.obj.id)
  }

  reportId(_, report: WeatherDto) {
    return report?.id;
  }

  private getLocation(successCB) {
    if (navigator?.geolocation) {
        navigator.geolocation?.getCurrentPosition((position)=>{
          const lon = position?.coords?.longitude;
          const lat = position?.coords?.latitude;
          successCB(lat, lon)
        });
    } else {
       return null
    }
  }
}
