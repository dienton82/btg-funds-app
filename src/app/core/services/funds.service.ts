import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, finalize, map, of, take, tap } from 'rxjs';

import { Fund } from '../../shared/models/fund.model';
import { NotificationMethod } from '../../shared/models/notification-method.type';
import { Transaction, TransactionType } from '../../shared/models/transaction.model';
import { ActionResult } from '../../shared/utils/action-result.type';
import { FundsRepository } from './funds.repository';

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

export interface PortfolioState {
  funds: readonly Fund[];
  balance: number;
  transactions: readonly Transaction[];
  subscribedFundIds: ReadonlySet<number>;
  isInitializing: boolean;
  isActionProcessing: boolean;
  loadError: string | null;
}

export interface TransactionsState {
  transactions: readonly Transaction[];
  isInitializing: boolean;
  isActionProcessing: boolean;
  loadError: string | null;
}

export type FundActionErrorCode =
  | 'FUND_NOT_FOUND'
  | 'FUND_ALREADY_SUBSCRIBED'
  | 'FUND_NOT_SUBSCRIBED'
  | 'AMOUNT_BELOW_MINIMUM'
  | 'INSUFFICIENT_BALANCE'
  | 'UNEXPECTED_ERROR';

export type FundActionResult = ActionResult<Transaction, FundActionErrorCode>;

@Injectable({
  providedIn: 'root'
})
export class FundsService {
  private readonly fundsRepository = inject(FundsRepository);
  private readonly initialBalance = 500000;

  private readonly balanceSubject = new BehaviorSubject<number>(this.initialBalance);
  private readonly fundsSubject = new BehaviorSubject<readonly Fund[]>([]);
  private readonly transactionsSubject = new BehaviorSubject<readonly Transaction[]>([]);
  private readonly subscribedFundsSubject = new BehaviorSubject<readonly Fund[]>([]);
  private readonly activeSubscriptionsSubject = new BehaviorSubject<readonly ActiveSubscription[]>([]);
  private readonly isInitializingSubject = new BehaviorSubject<boolean>(true);
  private readonly isActionProcessingSubject = new BehaviorSubject<boolean>(false);
  private readonly loadErrorSubject = new BehaviorSubject<string | null>(null);

  readonly balance$ = this.balanceSubject.asObservable();
  readonly funds$ = this.fundsSubject.asObservable();
  readonly transactions$ = this.transactionsSubject.asObservable();
  readonly subscribedFunds$ = this.subscribedFundsSubject.asObservable();
  readonly isInitializing$ = this.isInitializingSubject.asObservable();
  readonly isActionProcessing$ = this.isActionProcessingSubject.asObservable();
  readonly loadError$ = this.loadErrorSubject.asObservable();

  constructor() {
    this.loadFunds();
  }

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

  getPortfolioState(): Observable<PortfolioState> {
    return combineLatest({
      funds: this.funds$,
      balance: this.balance$,
      transactions: this.transactions$,
      subscribedFunds: this.subscribedFunds$,
      isInitializing: this.isInitializing$,
      isActionProcessing: this.isActionProcessing$,
      loadError: this.loadError$
    }).pipe(
      map(({ funds, balance, transactions, subscribedFunds, isInitializing, isActionProcessing, loadError }) => ({
        funds,
        balance,
        transactions,
        subscribedFundIds: new Set(subscribedFunds.map((fund) => fund.id)),
        isInitializing,
        isActionProcessing,
        loadError
      }))
    );
  }

  getTransactionsState(): Observable<TransactionsState> {
    return combineLatest({
      transactions: this.transactions$,
      isInitializing: this.isInitializing$,
      isActionProcessing: this.isActionProcessing$,
      loadError: this.loadError$
    });
  }

  subscribeToFund(payload: SubscribeToFundPayload): Observable<FundActionResult> {
    const validation = this.validateSubscription(payload);

    if (validation) {
      return of(validation);
    }

    const fund = this.findFundById(payload.fundId);

    if (!fund) {
      return of(this.createErrorResult('FUND_NOT_FOUND', 'No pudimos encontrar el fondo seleccionado.'));
    }

    this.isActionProcessingSubject.next(true);

    return this.fundsRepository.simulateSubscription().pipe(
      take(1),
      map(() => {
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
          success: true as const,
          data: this.registerTransaction(fund, 'SUBSCRIBE', payload.notificationMethod, payload.amount)
        };
      }),
      catchError(() =>
        of(this.createErrorResult('UNEXPECTED_ERROR', 'Ocurrió un error al procesar la suscripción.'))
      ),
      finalize(() => this.isActionProcessingSubject.next(false))
    );
  }

  cancelFund(payload: CancelFundPayload): Observable<FundActionResult> {
    const fund = this.findFundById(payload.fundId);

    if (!fund) {
      return of(this.createErrorResult('FUND_NOT_FOUND', 'No pudimos encontrar el fondo seleccionado.'));
    }

    const activeSubscription = this.findActiveSubscription(payload.fundId);

    if (!activeSubscription) {
      return of(
        this.createErrorResult(
          'FUND_NOT_SUBSCRIBED',
          'Este fondo no tiene una participación activa para cancelar.'
        )
      );
    }

    this.isActionProcessingSubject.next(true);

    return this.fundsRepository.simulateCancellation().pipe(
      take(1),
      map(() => {
        this.balanceSubject.next(this.balanceSubject.value + activeSubscription.amount);
        this.subscribedFundsSubject.next(
          this.subscribedFundsSubject.value.filter((subscribedFund) => subscribedFund.id !== payload.fundId)
        );
        this.activeSubscriptionsSubject.next(
          this.activeSubscriptionsSubject.value.filter((subscription) => subscription.fundId !== payload.fundId)
        );

        return {
          success: true as const,
          data: this.registerTransaction(
            fund,
            'CANCEL',
            activeSubscription.notificationMethod,
            activeSubscription.amount
          )
        };
      }),
      catchError(() =>
        of(this.createErrorResult('UNEXPECTED_ERROR', 'Ocurrió un error al cancelar la participación.'))
      ),
      finalize(() => this.isActionProcessingSubject.next(false))
    );
  }

  private loadFunds(): void {
    this.isInitializingSubject.next(true);
    this.loadErrorSubject.next(null);

    this.fundsRepository
      .getFunds()
      .pipe(
        take(1),
        tap((funds) => this.fundsSubject.next(funds)),
        catchError(() => {
          this.loadErrorSubject.next('No fue posible cargar el catálogo de fondos.');
          return of([] as readonly Fund[]);
        }),
        finalize(() => this.isInitializingSubject.next(false))
      )
      .subscribe();
  }

  private validateSubscription(payload: SubscribeToFundPayload): FundActionResult | null {
    const fund = this.findFundById(payload.fundId);

    if (!fund) {
      return this.createErrorResult('FUND_NOT_FOUND', 'No pudimos encontrar el fondo seleccionado.');
    }

    if (this.isFundSubscribed(payload.fundId)) {
      return this.createErrorResult('FUND_ALREADY_SUBSCRIBED', 'Este fondo ya se encuentra suscrito.');
    }

    if (payload.amount < fund.minAmount) {
      return this.createErrorResult(
        'AMOUNT_BELOW_MINIMUM',
        `El monto debe ser igual o superior a ${fund.minAmount}.`
      );
    }

    if (this.balanceSubject.value < payload.amount) {
      return this.createErrorResult(
        'INSUFFICIENT_BALANCE',
        'No tienes saldo disponible suficiente para completar la suscripción.'
      );
    }

    return null;
  }

  private createErrorResult(code: FundActionErrorCode, message: string): FundActionResult {
    return {
      success: false,
      code,
      message
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
