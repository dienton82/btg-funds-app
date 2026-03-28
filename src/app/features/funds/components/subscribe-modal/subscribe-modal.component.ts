import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { SubscribeToFundPayload } from '../../../../core/services/funds.service';
import { Fund } from '../../../../shared/models/fund.model';
import { NotificationMethod } from '../../../../shared/models/notification-method.type';
import { formatFundDisplayName } from '../../../../shared/utils/fund-name.util';

interface SubscribeForm {
  amount: FormControl<number | null>;
  notificationMethod: FormControl<NotificationMethod | null>;
}

@Component({
  selector: 'app-subscribe-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscribe-modal.component.html',
  styleUrl: './subscribe-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscribeModalComponent implements OnChanges {
  @Input({ required: true }) fund!: Fund;
  @Input({ required: true }) balance = 0;
  @Input() submitError: string | null = null;
  @Input() isSubmitting = false;

  @Output() readonly closeModal = new EventEmitter<void>();
  @Output() readonly confirmSubscription = new EventEmitter<SubscribeToFundPayload>();
  @Output() readonly clearState = new EventEmitter<void>();

  readonly form = new FormGroup<SubscribeForm>({
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required]
    }),
    notificationMethod: new FormControl<NotificationMethod | null>(null, {
      validators: [Validators.required]
    })
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fund'] || changes['balance']) {
      this.form.controls.amount.setValidators([
        Validators.required,
        this.minAmountValidator(),
        this.balanceValidator()
      ]);
      this.form.controls.amount.updateValueAndValidity({ emitEvent: false });
    }

    if (changes['fund']?.currentValue) {
      this.resetForm();
    }
  }

  onCancel(): void {
    if (this.isSubmitting) {
      return;
    }

    this.closeModal.emit();
  }

  onClear(): void {
    if (this.isSubmitting) {
      return;
    }

    this.resetForm();
    this.clearState.emit();
  }

  onConfirm(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { amount, notificationMethod } = this.form.getRawValue();

    if (amount === null || notificationMethod === null) {
      return;
    }

    this.confirmSubscription.emit({
      fundId: this.fund.id,
      amount,
      notificationMethod
    });
  }

  get amountControl(): FormControl<number | null> {
    return this.form.controls.amount;
  }

  get notificationMethodControl(): FormControl<NotificationMethod | null> {
    return this.form.controls.notificationMethod;
  }

  get amountDescribedBy(): string {
    return this.amountControl.invalid && this.amountControl.touched
      ? 'amount-help amount-errors'
      : 'amount-help';
  }

  get notificationMethodDescribedBy(): string | null {
    return this.notificationMethodControl.invalid && this.notificationMethodControl.touched
      ? 'notification-errors'
      : null;
  }

  get formattedFundName(): string {
    return formatFundDisplayName(this.fund.name);
  }

  private resetForm(): void {
    this.form.reset({
      amount: this.fund.minAmount,
      notificationMethod: null
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private minAmountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === '') {
        return null;
      }

      return Number(value) < this.fund.minAmount
        ? { minAmount: { requiredMinAmount: this.fund.minAmount } }
        : null;
    };
  }

  private balanceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value === null || value === '') {
        return null;
      }

      return Number(value) > this.balance
        ? { insufficientBalance: { availableBalance: this.balance } }
        : null;
    };
  }
}
