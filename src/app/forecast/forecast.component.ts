import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForecastDto, WeatherDto } from '../core/weather.dto';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForecastComponent implements OnInit {
  forcastData$: Observable<ForecastDto>

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.forcastData$ = this.route.data.pipe(
      switchMap(
        (resolved: {forecastData: ForecastDto}) => of(resolved.forecastData)
      )
    )
  }

}
