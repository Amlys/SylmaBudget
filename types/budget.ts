export type BudgetRecurrence = 'weekly' | 'monthly' | 'yearly';

export interface Budget {
  id: string;
  title: string;
  description: string;
  amount: number;
  spent: number;
  recurrence?: BudgetRecurrence;
  createdAt: string;
  period: string; // Format: YYYY-MM pour monthly, YYYY-WW pour weekly, YYYY pour yearly
  isActive: boolean;
}

export interface BudgetFormData {
  title: string;
  description: string;
  amount: number;
  recurrence?: BudgetRecurrence;
}