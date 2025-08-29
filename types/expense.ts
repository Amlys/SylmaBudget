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
}

export interface ExpenseFormData {
  title: string;
  amount: number;
  icon: string;
  budgetId?: string;
}

export type DateFilter = 'day' | 'week' | 'month' | 'year';