import { NotificationMethod } from './notification-method.type';

export type TransactionType = 'SUBSCRIBE' | 'CANCEL';

export interface Transaction {
  id: number;
  fundId: number;
  fundName: string;
  type: TransactionType;
  amount: number;
  notificationMethod: NotificationMethod;
  date: string;
}
