import { Fund } from '../../shared/models/fund.model';

export const FUNDS_MOCK: readonly Fund[] = [
  {
    id: 1,
    name: 'FPV_BTG_PACTUAL_RECAUDADORA',
    minAmount: 75000,
    category: 'FPV'
  },
  {
    id: 2,
    name: 'FPV_BTG_PACTUAL_ECOPETROL',
    minAmount: 125000,
    category: 'FPV'
  },
  {
    id: 3,
    name: 'DEUDAPRIVADA',
    minAmount: 50000,
    category: 'FIC'
  },
  {
    id: 4,
    name: 'FDO-ACCIONES',
    minAmount: 250000,
    category: 'FIC'
  },
  {
    id: 5,
    name: 'FPV_BTG_PACTUAL_DINAMICA',
    minAmount: 100000,
    category: 'FPV'
  }
];
