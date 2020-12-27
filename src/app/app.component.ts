import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { WeatherService } from './core/weather.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  name = "Angular";

  zipCodeControl: FormControl = new FormControl('', [Validators.required]);

  constructor(
    private weatherService: WeatherService
  ) {
    //TODO: refactor UI components into their own compo
    this.weatherService.getWeatherReports().subscribe(res => console.log(res))
  }

  addLocation() {
    this.weatherService.addNewZipCode(this.zipCodeControl.value);
    this.zipCodeControl.reset()
  }
}
