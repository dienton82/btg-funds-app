import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { FUNDS_MOCK } from './funds.mock';
import { Fund } from '../../shared/models/fund.model';

export const FUNDS_LOAD_DELAY_MS = 450;
export const FUND_ACTION_DELAY_MS = 550;

@Injectable({
  providedIn: 'root'
})
export class FundsRepository {
  getFunds(): Observable<readonly Fund[]> {
    return of(FUNDS_MOCK).pipe(delay(FUNDS_LOAD_DELAY_MS));
  }

  simulateSubscription(): Observable<void> {
    return of(void 0).pipe(delay(FUND_ACTION_DELAY_MS));
  }

  simulateCancellation(): Observable<void> {
    return of(void 0).pipe(delay(FUND_ACTION_DELAY_MS));
  }
}
