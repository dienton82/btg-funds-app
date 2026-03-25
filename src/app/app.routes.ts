import { Routes } from '@angular/router';

import { FundsPageComponent } from './features/funds/pages/funds-page/funds-page.component';
import { TransactionsPageComponent } from './features/transactions/pages/transactions-page/transactions-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'funds'
  },
  {
    path: 'funds',
    component: FundsPageComponent
  },
  {
    path: 'transactions',
    component: TransactionsPageComponent
  }
];
