export type FundCategory = 'FPV' | 'FIC';

export interface Fund {
  id: number;
  name: string;
  minAmount: number;
  category: FundCategory;
}
