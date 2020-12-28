import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
  zipCodeControl: FormControl = new FormControl('', [Validators.required]);
  weatherReports$: Observable<WeatherReport[]> = this.weatherService.getWeatherReports();
  zipCodeGetError$: Observable<string> = this.weatherService.getZipCodeGetError();
  
  constructor(
    private weatherService: WeatherService
  ) { }

  ngOnInit(): void {
  }

  deleteZipcode(zipCode: string) {
    this.weatherService.removeZipCode(zipCode);
  }

  addLocation() {
    this.weatherService.addNewZipCode(this.zipCodeControl.value);
    this.zipCodeControl.reset()
  }
}
