import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { LOCAL_STORAGE, StorageService } from "ngx-webstorage-service";
import { WeatherService } from './core/weather.service';

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  name = "Angular";

  constructor(
    @Inject(LOCAL_STORAGE) private storage: StorageService,
    private weatherService: WeatherService
  ) {
    this.weatherService.getWeatherByZipCode('95122').subscribe(m => console.log(m))
  }
}
