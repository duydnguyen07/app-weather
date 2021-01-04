import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { StorageServiceModule } from "ngx-webstorage-service";
import { ReactiveFormsModule } from '@angular/forms';
import { WeatherReportComponent } from './home/weather-report/weather-report.component';
import { SharedModule } from './shared/shared.module';
import { HomeComponent } from './home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { ApiPrefixInterceptor } from './core/api-prefix.interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule, 
    FormsModule, 
    StorageServiceModule, 
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    SharedModule,
    TypeaheadModule.forRoot(),
  ],
  declarations: [
    AppComponent, 
    WeatherReportComponent, 
    HomeComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiPrefixInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
