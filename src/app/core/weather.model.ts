import { WeatherDto } from './weather.dto';

export interface WeatherReport extends WeatherDto {
   zipCode: string;
}
