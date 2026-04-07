import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
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
  @ViewChildren('notificationOption')
  private readonly notificationOptionButtons?: QueryList<ElementRef<HTMLButtonElement>>;
  @ViewChild('notificationShell')
  private readonly notificationShell?: ElementRef<HTMLElement>;

  readonly notificationOptions: ReadonlyArray<{ value: NotificationMethod; label: string }> = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' }
  ];

  isNotificationMenuOpen = false;
  notificationMenuDirection: 'down' | 'up' = 'down';

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

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isNotificationMenuOpen) {
      this.closeNotificationMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isNotificationMenuOpen) {
      return;
    }

    const clickTarget = event.target;
    if (!(clickTarget instanceof Node)) {
      return;
    }

    if (this.notificationShell?.nativeElement.contains(clickTarget)) {
      return;
    }

    this.closeNotificationMenu();
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

  get selectedNotificationLabel(): string {
    const selectedMethod = this.notificationMethodControl.value;
    return this.notificationOptions.find((option) => option.value === selectedMethod)?.label ?? 'Selecciona una opción';
  }

  get selectedNotificationIndex(): number {
    const selectedMethod = this.notificationMethodControl.value;
    return this.notificationOptions.findIndex((option) => option.value === selectedMethod);
  }

  toggleNotificationMenu(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isNotificationMenuOpen = !this.isNotificationMenuOpen;

    if (this.isNotificationMenuOpen) {
      queueMicrotask(() => {
        this.updateNotificationMenuDirection();
        this.focusNotificationOption(this.selectedNotificationIndex >= 0 ? this.selectedNotificationIndex : 0);
      });
    }
  }

  closeNotificationMenu(): void {
    this.isNotificationMenuOpen = false;
  }

  selectNotificationMethod(method: NotificationMethod): void {
    if (this.isSubmitting) {
      return;
    }

    this.notificationMethodControl.setValue(method);
    this.notificationMethodControl.markAsDirty();
    this.notificationMethodControl.markAsTouched();
    this.notificationMethodControl.updateValueAndValidity({ emitEvent: false });
    this.closeNotificationMenu();
  }

  onNotificationTriggerKeydown(event: KeyboardEvent): void {
    if (this.isSubmitting) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.isNotificationMenuOpen) {
        this.toggleNotificationMenu();
        return;
      }

      this.focusNotificationOption(this.selectedNotificationIndex >= 0 ? this.selectedNotificationIndex : 0);
    }

    if (event.key === 'Escape') {
      this.closeNotificationMenu();
    }
  }

  onNotificationOptionKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusNotificationOption((index + 1) % this.notificationOptions.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusNotificationOption((index - 1 + this.notificationOptions.length) % this.notificationOptions.length);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeNotificationMenu();
    }
  }

  private resetForm(): void {
    this.form.reset({
      amount: this.fund.minAmount,
      notificationMethod: null
    });
    this.closeNotificationMenu();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private focusNotificationOption(index: number): void {
    this.notificationOptionButtons?.get(index)?.nativeElement.focus();
  }

  private updateNotificationMenuDirection(): void {
    const shell = this.notificationShell?.nativeElement;
    if (!shell) {
      this.notificationMenuDirection = 'down';
      return;
    }

    const rect = shell.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedMenuHeight = 132;
    const spacing = 12;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    this.notificationMenuDirection =
      spaceBelow >= estimatedMenuHeight || spaceBelow >= spaceAbove - spacing ? 'down' : 'up';
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
