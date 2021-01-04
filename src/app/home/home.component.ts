import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { WeatherService } from '../core/weather.service';
import { WeatherReport } from "../core/weather.model";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  cityControl: FormControl = new FormControl('', [Validators.required]);
  weatherReports$: Observable<WeatherReport[]> = this.weatherService.getWeatherReports();
  zipCodeGetError$: Observable<string> = this.weatherService.getZipCodeGetError();
  
  constructor(
    private weatherService: WeatherService,
    private cdr: ChangeDetectorRef
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
  }

  deleteZipcode(zipCode: string) {
    this.weatherService.removeZipCode(zipCode);
  }

  // addLocation() {
  //   this.weatherService.addNewZipCode(this.zipCodeControl.value);
  //   this.zipCodeControl.reset()
  // }

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
