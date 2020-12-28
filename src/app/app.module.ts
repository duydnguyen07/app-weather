import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { StorageServiceModule } from "ngx-webstorage-service";
import { HttpClientModule } from "@angular/common/http";
import { ReactiveFormsModule } from '@angular/forms';
import { WeatherReportComponent } from './home/weather-report/weather-report.component';
import { SharedModule } from './shared/shared.module';
import { HomeComponent } from './home/home.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  imports: [
    BrowserModule, 
    FormsModule, 
    StorageServiceModule, 
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    AppComponent, 
    WeatherReportComponent, 
    HomeComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
