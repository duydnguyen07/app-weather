import { WeatherIconUrlPipe } from './weather-icon-url.pipe';

describe('WeatherIconUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new WeatherIconUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
