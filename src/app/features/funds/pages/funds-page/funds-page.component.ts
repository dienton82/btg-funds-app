import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';

import {
  CancelFundPayload,
  FundsService,
  SubscribeToFundPayload
} from '../../../../core/services/funds.service';
import { SubscribeModalComponent } from '../../components/subscribe-modal/subscribe-modal.component';
import { Fund } from '../../../../shared/models/fund.model';
import { formatFundDisplayName } from '../../../../shared/utils/fund-name.util';

interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-funds-page',
  standalone: true,
  imports: [CommonModule, SubscribeModalComponent],
  templateUrl: './funds-page.component.html',
  styleUrl: './funds-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FundsPageComponent {
  private readonly fundsService = inject(FundsService);
  private feedbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly selectedFund = signal<Fund | null>(null);
  readonly pendingCancellationFund = signal<Fund | null>(null);
  readonly feedback = signal<FeedbackState | null>(null);
  readonly modalError = signal<string | null>(null);

  readonly vm$ = combineLatest({
    funds: this.fundsService.getFunds(),
    balance: this.fundsService.getBalance(),
    transactions: this.fundsService.getTransactions(),
    subscribedFunds: this.fundsService.getSubscribedFunds()
  }).pipe(
    map(({ funds, balance, transactions, subscribedFunds }) => ({
      funds,
      balance,
      transactions,
      subscribedFundIds: new Set(subscribedFunds.map((fund) => fund.id))
    }))
  );

  readonly isModalOpen = computed(() => this.selectedFund() !== null);
  readonly isCancelPanelOpen = computed(() => this.pendingCancellationFund() !== null);

  onSubscribe(fund: Fund): void {
    this.selectedFund.set(fund);
    this.pendingCancellationFund.set(null);
    this.modalError.set(null);
  }

  onRequestCancellation(fund: Fund): void {
    this.pendingCancellationFund.set(fund);
    this.selectedFund.set(null);
    this.modalError.set(null);
  }

  onCloseModal(): void {
    this.selectedFund.set(null);
    this.clearModalState();
  }

  onDismissCancellation(): void {
    this.pendingCancellationFund.set(null);
  }

  onConfirmSubscription(payload: SubscribeToFundPayload): void {
    const result = this.fundsService.subscribeToFund(payload);

    if (!result.success) {
      this.modalError.set(result.message);
      this.showFeedback({
        type: 'error',
        message: result.message
      });
      return;
    }

    this.showFeedback({
      type: 'success',
      message: `Suscripción exitosa a ${this.formatFundName(result.data.fundName)}.`
    });
    this.onCloseModal();
  }

  onConfirmCancellation(payload: CancelFundPayload): void {
    const result = this.fundsService.cancelFund(payload);

    if (!result.success) {
      this.showFeedback({
        type: 'error',
        message: result.message
      });
      return;
    }

    this.showFeedback({
      type: 'success',
      message: `Participación cancelada en ${this.formatFundName(result.data.fundName)}.`
    });
    this.onDismissCancellation();
  }

  onClearModalState(): void {
    this.clearModalState();
  }

  clearFeedback(): void {
    if (this.feedbackTimeoutId) {
      clearTimeout(this.feedbackTimeoutId);
      this.feedbackTimeoutId = null;
    }

    this.feedback.set(null);
  }

  formatFundName(name: string): string {
    return formatFundDisplayName(name);
  }

  trackByFundId(_index: number, fund: Fund): number {
    return fund.id;
  }

  private showFeedback(feedback: FeedbackState): void {
    this.feedback.set(feedback);

    if (this.feedbackTimeoutId) {
      clearTimeout(this.feedbackTimeoutId);
    }

    this.feedbackTimeoutId = setTimeout(() => {
      this.feedback.set(null);
      this.feedbackTimeoutId = null;
    }, 3200);
  }

  private clearModalState(): void {
    this.modalError.set(null);
  }
}
