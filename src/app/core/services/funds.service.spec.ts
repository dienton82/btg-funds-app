import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FUND_ACTION_DELAY_MS, FUNDS_LOAD_DELAY_MS, FundsRepository } from './funds.repository';
import { FundsService } from './funds.service';

describe('FundsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FundsRepository, FundsService]
    });
  });

  it('should load the catalog asynchronously on initialization', fakeAsync(() => {
    const service = TestBed.inject(FundsService);
    let fundsCount = -1;
    let isInitializing = true;

    service.getFunds().subscribe((funds) => {
      fundsCount = funds.length;
    });

    service.getPortfolioState().subscribe((state) => {
      isInitializing = state.isInitializing;
    });

    expect(fundsCount).toBe(0);
    expect(isInitializing).toBeTrue();

    tick(FUNDS_LOAD_DELAY_MS);

    expect(fundsCount).toBe(5);
    expect(isInitializing).toBeFalse();
  }));

  it('should subscribe to a fund and update balance, state and transactions', fakeAsync(() => {
    const service = TestBed.inject(FundsService);
    let balance = 0;
    let subscribedFundIds: ReadonlySet<number> = new Set<number>();
    let transactionsCount = 0;
    let result: unknown;

    service.getPortfolioState().subscribe((state) => {
      balance = state.balance;
      subscribedFundIds = state.subscribedFundIds;
      transactionsCount = state.transactions.length;
    });

    tick(FUNDS_LOAD_DELAY_MS);

    service
      .subscribeToFund({
        fundId: 1,
        amount: 80000,
        notificationMethod: 'email'
      })
      .subscribe((value) => {
        result = value;
      });

    expect(balance).toBe(500000);
    expect(transactionsCount).toBe(0);

    tick(FUND_ACTION_DELAY_MS);

    expect(result).toEqual(
      jasmine.objectContaining({
        success: true,
        data: jasmine.objectContaining({
          fundId: 1,
          type: 'SUBSCRIBE',
          amount: 80000,
          notificationMethod: 'email'
        })
      })
    );
    expect(balance).toBe(420000);
    expect(subscribedFundIds.has(1)).toBeTrue();
    expect(transactionsCount).toBe(1);
  }));

  it('should reject a subscription when balance is insufficient', fakeAsync(() => {
    const service = TestBed.inject(FundsService);
    let balance = 0;
    let transactionsCount = 0;
    let result: unknown;

    service.getPortfolioState().subscribe((state) => {
      balance = state.balance;
      transactionsCount = state.transactions.length;
    });

    tick(FUNDS_LOAD_DELAY_MS);

    service
      .subscribeToFund({
        fundId: 4,
        amount: 700000,
        notificationMethod: 'sms'
      })
      .subscribe((value) => {
        result = value;
      });

    tick();

    expect(result).toEqual({
      success: false,
      code: 'INSUFFICIENT_BALANCE',
      message: 'No tienes saldo disponible suficiente para completar la suscripción.'
    });
    expect(balance).toBe(500000);
    expect(transactionsCount).toBe(0);
  }));

  it('should cancel an active subscription and restore the subscribed amount', fakeAsync(() => {
    const service = TestBed.inject(FundsService);
    let balance = 0;
    let subscribedFundIds: ReadonlySet<number> = new Set<number>();
    let transactionsCount = 0;
    let result: unknown;

    service.getPortfolioState().subscribe((state) => {
      balance = state.balance;
      subscribedFundIds = state.subscribedFundIds;
      transactionsCount = state.transactions.length;
    });

    tick(FUNDS_LOAD_DELAY_MS);

    service
      .subscribeToFund({
        fundId: 3,
        amount: 65000,
        notificationMethod: 'sms'
      })
      .subscribe();

    tick(FUND_ACTION_DELAY_MS);

    service.cancelFund({ fundId: 3 }).subscribe((value) => {
      result = value;
    });

    expect(balance).toBe(435000);
    expect(subscribedFundIds.has(3)).toBeTrue();

    tick(FUND_ACTION_DELAY_MS);

    expect(result).toEqual(
      jasmine.objectContaining({
        success: true,
        data: jasmine.objectContaining({
          fundId: 3,
          type: 'CANCEL',
          amount: 65000,
          notificationMethod: 'sms'
        })
      })
    );
    expect(balance).toBe(500000);
    expect(subscribedFundIds.has(3)).toBeFalse();
    expect(transactionsCount).toBe(2);
  }));
});
