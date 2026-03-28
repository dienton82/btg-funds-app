import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FUNDS_MOCK } from './funds.mock';
import { FUND_ACTION_DELAY_MS, FUNDS_LOAD_DELAY_MS, FundsRepository } from './funds.repository';
import { Fund } from '../../shared/models/fund.model';

describe('FundsRepository', () => {
  let repository: FundsRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FundsRepository]
    });

    repository = TestBed.inject(FundsRepository);
  });

  it('should load the mocked catalog asynchronously', fakeAsync(() => {
    let funds: readonly Fund[] = [];

    repository.getFunds().subscribe((value) => {
      funds = value;
    });

    expect(funds.length).toBe(0);

    tick(FUNDS_LOAD_DELAY_MS);

    expect(funds).toEqual(FUNDS_MOCK);
  }));

  it('should simulate delayed subscription and cancellation requests', fakeAsync(() => {
    let subscriptionResolved = false;
    let cancellationResolved = false;

    repository.simulateSubscription().subscribe(() => {
      subscriptionResolved = true;
    });
    repository.simulateCancellation().subscribe(() => {
      cancellationResolved = true;
    });

    expect(subscriptionResolved).toBeFalse();
    expect(cancellationResolved).toBeFalse();

    tick(FUND_ACTION_DELAY_MS);

    expect(subscriptionResolved).toBeTrue();
    expect(cancellationResolved).toBeTrue();
  }));
});
