import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { WeatherService } from '../core/weather.service';
import { WeatherReport } from "../core/weather.model";
import { BehaviorSubject, fromEvent, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, debounceTime, tap } from 'rxjs/operators';
import { HomeService, City } from './home.service';
import { TypeaheadDirective, TypeaheadMatch } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit {
  cityControl: FormControl = new FormControl('', [Validators.required]);
  weatherReports$: Observable<WeatherReport[]> = this.weatherService.getWeatherReports();
  zipCodeGetError$: Observable<string> = this.weatherService.getZipCodeGetError();
  typeAheadSuggestions$: Observable<Fuzzysort.KeyResult<City>[]> = new BehaviorSubject([])

  // @ViewChild("cityInput")
  // cityInput: ElementRef;

  constructor(
    private weatherService: WeatherService,
    private cdr: ChangeDetectorRef,
    private homeService: HomeService
  ) { }

  ngOnInit() {
    this.getLocation((lat, lon) => {
        this.weatherService.getWeatherByLatLon(lat, lon).subscribe((report: WeatherReport) => {
          // Set value of control if user has not filled it out yet
          if(!this.cityControl.value) {
            this.cityControl.setValue(report.name)
            this.cdr.detectChanges();
          }
        })
    });

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
  }

  ngAfterViewInit() {
  }

  deleteCity(id: string) {
    this.weatherService.removeZipCode(id);
  }

  addLocation(match: TypeaheadMatch) {
    console.log(match)
    //TODO: fetch weather based on match
    // this.weatherService.addNewZipCode(this.zipCodeControl.value);
    // this.zipCodeControl.reset()
  }

  reportZipCode(_, report: WeatherReport) {
    return report?.zipCode;
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
