import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isUnauthenticatedGuard } from './is-unauthenticated.guard';

describe('isUnauthenticatedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isUnauthenticatedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
