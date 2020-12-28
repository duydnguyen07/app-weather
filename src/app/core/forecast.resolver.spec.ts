import { TestBed } from '@angular/core/testing';

import { ForecastResolver } from './forecast.resolver';

describe('ForecastResolver', () => {
  let resolver: ForecastResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ForecastResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
