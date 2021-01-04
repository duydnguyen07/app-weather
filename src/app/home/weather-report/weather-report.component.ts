import { ChangeDetectionStrategy, Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-weather-report',
  templateUrl: './weather-report.component.html',
  styleUrls: ['./weather-report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherReportComponent implements OnInit {
  @Input()
  id: number

  @Input()
  zipCode: string;

  @Input()
  locationName: string;

  @Input()
  condition: string;

  @Input()
  currentTemp: string;

  @Input()
  maxTemp: string;

  @Input()
  minTemp: string;

  @Output()
  deleteEvent: EventEmitter<string> = new EventEmitter();

  constructor() { 
  }

  ngOnInit(): void {
  }
}
