import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ForecastResolver } from './core/forecast.resolver';

const routes: Routes = [
  {
    path: 'forecast/:zipCode',
    loadChildren: () => import('./forecast/forecast.module').then(m => m.ForecastModule),
    resolve: {
      forecastData: ForecastResolver
    }
  },
  {
    path: '',
    component: HomeComponent
  },
  // Fallback when no prior route is matched
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
    CommonModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
