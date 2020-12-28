import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherIconUrlPipe } from './weather-icon-url.pipe';

@NgModule({
  declarations: [WeatherIconUrlPipe],
  imports: [
    CommonModule
  ],
  exports: [WeatherIconUrlPipe]
})
export class SharedModule { }
