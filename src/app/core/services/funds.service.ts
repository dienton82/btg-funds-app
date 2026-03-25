import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { FUNDS_MOCK } from './funds.mock';
import { Fund } from '../../shared/models/fund.model';
import { NotificationMethod } from '../../shared/models/notification-method.type';
import { Transaction, TransactionType } from '../../shared/models/transaction.model';
import { ActionResult } from '../../shared/utils/action-result.type';

interface ActiveSubscription {
  fundId: number;
  amount: number;
  notificationMethod: NotificationMethod;
}

export interface SubscribeToFundPayload {
  fundId: number;
  amount: number;
  notificationMethod: NotificationMethod;
}

export interface CancelFundPayload {
  fundId: number;
}

export type FundActionErrorCode =
  | 'FUND_NOT_FOUND'
  | 'FUND_ALREADY_SUBSCRIBED'
  | 'FUND_NOT_SUBSCRIBED'
  | 'AMOUNT_BELOW_MINIMUM'
  | 'INSUFFICIENT_BALANCE';

export type FundActionResult = ActionResult<Transaction, FundActionErrorCode>;

@Injectable({
  providedIn: 'root'
})
export class FundsService {
  private readonly initialBalance = 500000;

  private readonly balanceSubject = new BehaviorSubject<number>(this.initialBalance);
  private readonly fundsSubject = new BehaviorSubject<readonly Fund[]>(FUNDS_MOCK);
  private readonly transactionsSubject = new BehaviorSubject<readonly Transaction[]>([]);
  private readonly subscribedFundsSubject = new BehaviorSubject<readonly Fund[]>([]);
  private readonly activeSubscriptionsSubject = new BehaviorSubject<readonly ActiveSubscription[]>([]);

  readonly balance$ = this.balanceSubject.asObservable();
  readonly funds$ = this.fundsSubject.asObservable();
  readonly transactions$ = this.transactionsSubject.asObservable();
  readonly subscribedFunds$ = this.subscribedFundsSubject.asObservable();

  getFunds(): Observable<readonly Fund[]> {
    return this.funds$;
  }

  getBalance(): Observable<number> {
    return this.balance$;
  }

  getTransactions(): Observable<readonly Transaction[]> {
    return this.transactions$;
  }

  getSubscribedFunds(): Observable<readonly Fund[]> {
    return this.subscribedFunds$;
  }

  subscribeToFund(payload: SubscribeToFundPayload): FundActionResult {
    const fund = this.findFundById(payload.fundId);

    if (!fund) {
      return {
        success: false,
        code: 'FUND_NOT_FOUND',
        message: 'No pudimos encontrar el fondo seleccionado.'
      };
    }

    if (this.isFundSubscribed(payload.fundId)) {
      return {
        success: false,
        code: 'FUND_ALREADY_SUBSCRIBED',
        message: 'Este fondo ya se encuentra suscrito.'
      };
    }

    if (payload.amount < fund.minAmount) {
      return {
        success: false,
        code: 'AMOUNT_BELOW_MINIMUM',
        message: `El monto debe ser igual o superior a ${fund.minAmount}.`
      };
    }

    if (this.balanceSubject.value < payload.amount) {
      return {
        success: false,
        code: 'INSUFFICIENT_BALANCE',
        message: 'No tienes saldo disponible suficiente para completar la suscripcion.'
      };
    }

    this.balanceSubject.next(this.balanceSubject.value - payload.amount);
    this.subscribedFundsSubject.next([...this.subscribedFundsSubject.value, fund]);
    this.activeSubscriptionsSubject.next([
      ...this.activeSubscriptionsSubject.value,
      {
        fundId: fund.id,
        amount: payload.amount,
        notificationMethod: payload.notificationMethod
      }
    ]);

    return {
      success: true,
      data: this.registerTransaction(fund, 'SUBSCRIBE', payload.notificationMethod, payload.amount)
    };
  }

  cancelFund(payload: CancelFundPayload): FundActionResult {
    const fund = this.findFundById(payload.fundId);

    if (!fund) {
      return {
        success: false,
        code: 'FUND_NOT_FOUND',
        message: 'No pudimos encontrar el fondo seleccionado.'
      };
    }

    const activeSubscription = this.findActiveSubscription(payload.fundId);

    if (!activeSubscription) {
      return {
        success: false,
        code: 'FUND_NOT_SUBSCRIBED',
        message: 'Este fondo no tiene una participacion activa para cancelar.'
      };
    }

    this.balanceSubject.next(this.balanceSubject.value + activeSubscription.amount);
    this.subscribedFundsSubject.next(
      this.subscribedFundsSubject.value.filter((subscribedFund) => subscribedFund.id !== payload.fundId)
    );
    this.activeSubscriptionsSubject.next(
      this.activeSubscriptionsSubject.value.filter((subscription) => subscription.fundId !== payload.fundId)
    );

    return {
      success: true,
      data: this.registerTransaction(
        fund,
        'CANCEL',
        activeSubscription.notificationMethod,
        activeSubscription.amount
      )
    };
  }

  private findFundById(fundId: number): Fund | undefined {
    return this.fundsSubject.value.find((fund) => fund.id === fundId);
  }

  private findActiveSubscription(fundId: number): ActiveSubscription | undefined {
    return this.activeSubscriptionsSubject.value.find((subscription) => subscription.fundId === fundId);
  }

  private isFundSubscribed(fundId: number): boolean {
    return this.activeSubscriptionsSubject.value.some((subscription) => subscription.fundId === fundId);
  }

  private registerTransaction(
    fund: Fund,
    type: TransactionType,
    notificationMethod: NotificationMethod,
    amount: number
  ): Transaction {
    const transaction: Transaction = {
      id: this.transactionsSubject.value.length + 1,
      fundId: fund.id,
      fundName: fund.name,
      type,
      amount,
      notificationMethod,
      date: new Date().toISOString()
    };

    this.transactionsSubject.next([...this.transactionsSubject.value, transaction]);

    return transaction;
  }
}
