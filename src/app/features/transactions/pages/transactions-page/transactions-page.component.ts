import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FundsService } from '../../../../core/services/funds.service';
import { Transaction } from '../../../../shared/models/transaction.model';
import { formatFundDisplayName } from '../../../../shared/utils/fund-name.util';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsPageComponent {
  private readonly fundsService = inject(FundsService);

  readonly vm$ = this.fundsService.getTransactionsState();
  readonly loadingRows = Array.from({ length: 3 }, (_, index) => index);

  formatFundName(name: string): string {
    return formatFundDisplayName(name);
  }

  trackByTransactionId(_index: number, transaction: Transaction): number {
    return transaction.id;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
