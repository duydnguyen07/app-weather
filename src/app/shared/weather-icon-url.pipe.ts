import { Pipe, PipeTransform } from '@angular/core';
import { ILLUSTRATIONS } from '../app.model';

@Pipe({
  name: 'weatherIconUrl'
})
export class WeatherIconUrlPipe implements PipeTransform {

  transform(condition: string): string {
    if(condition === "Clear") {
      return ILLUSTRATIONS.sun;
    } else if (
      condition === "Thunderstorm" || 
      condition === "Rain" ||
      condition === "Drizzle"
    ) {
      return ILLUSTRATIONS.rain;
    } else if (condition === "Snow") {
      return ILLUSTRATIONS.snow;
    } else {
      return ILLUSTRATIONS.clouds;
    }
  }

}
