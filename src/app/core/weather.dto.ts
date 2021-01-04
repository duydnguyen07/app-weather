
export interface WeatherDto {
   cod: 404 | 200;
   message?: string;
   weather: [
      {
         id: number;
         main: string;
      }
   ];
   main: {
      temp: number;
      temp_min: number;
      temp_max: number;
   };
   dt: number;
   id: number;
   coord: { 
      lon: number, 
      lat: number
   }
   name: string;
}

export interface ForecastDto {
   cod: "200" | "404",
   message: string,
   list: Array<{
      dt: number,
      temp: {
         min: number,
         max: number,
      },
      weather: [
         {
            main: string
         }
      ]
   }>,
   city: {
      name: string
   }
}