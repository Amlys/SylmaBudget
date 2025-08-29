export interface Expense {
  id: string;
  title: string;
  amount: number;
  icon: string;
  count: number;
  totalAmount: number;
  createdAt: string;
  lastPurchaseAt: string;
  purchaseDates: string[];
  isArchived?: boolean;
  budgetId?: string;
  isRecurring?: boolean;
  // Budget individuel de la dépense
  budgetAmount?: number;
  budgetRecurrence?: 'weekly' | 'monthly' | 'yearly';
  budgetPeriod?: string;
  budgetSpent?: number;
}

export interface ExpenseFormData {
  title: string;
  amount: number;
  icon: string;
  budgetId?: string;
  isRecurring?: boolean;
  // Budget individuel de la dépense (seulement si récurrente)
  budgetAmount?: number;
  budgetRecurrence?: 'weekly' | 'monthly' | 'yearly';
}

export type DateFilter = 'day' | 'week' | 'month' | 'year';