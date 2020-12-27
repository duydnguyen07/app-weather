import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { WeatherService } from '../core/weather.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  zipCodeControl: FormControl = new FormControl('', [Validators.required]);
  
  weatherReport = {
    zipCode: "95122",
    locationName: "San Jose",
    condition: "Clear",
    currentTemp: "65",
    maxTemp: "85",
    minTemp: "55",
  }
  
  constructor(
    private weatherService: WeatherService
  ) { }

  ngOnInit(): void {
  }

  deleteZipcode(zipCode: string) {
    console.log('TODO: Delete zipcode', zipCode);
  }

  addLocation() {
    this.weatherService.addNewZipCode(this.zipCodeControl.value);
    this.zipCodeControl.reset()
    // this.weatherService.getWeatherByZipCode('95122').subscribe(m => console.log(m))
  }
}
