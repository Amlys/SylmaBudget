import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '@/types/expense';
import { budgetUtils } from './budgetStorage';

type ExpenseBudgetRecurrence = 'weekly' | 'monthly' | 'yearly';

const EXPENSES_KEY = 'amlys_pay_expenses';

export const storageUtils = {
  // Utilitaires pour budget individuel des dépenses
  getCurrentExpenseBudgetPeriod(recurrence?: ExpenseBudgetRecurrence): string {
    // Réutilise la logique des budgets globaux
    return budgetUtils.getCurrentPeriod(recurrence as any);
  },

  checkAndRefreshExpenseBudgetPeriod(expense: Expense): Expense {
    if (!expense.budgetRecurrence || !expense.budgetAmount) {
      return expense;
    }

    const currentPeriod = this.getCurrentExpenseBudgetPeriod(expense.budgetRecurrence);
    
    // Si la période a changé, reset le montant dépensé
    if (expense.budgetPeriod !== currentPeriod) {
      return {
        ...expense,
        budgetPeriod: currentPeriod,
        budgetSpent: 0
      };
    }
    
    return expense;
  },
  async getExpenses(): Promise<Expense[]> {
    try {
      const data = await AsyncStorage.getItem(EXPENSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  },

  async saveExpenses(expenses: Expense[]): Promise<void> {
    try {
      await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'count' | 'totalAmount' | 'purchaseDates'>): Promise<void> {
    const expenses = await this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      count: 1,
      totalAmount: expense.amount,
      purchaseDates: [expense.createdAt],
    };
    
    // Initialiser le budget individuel si fourni
    if (expense.budgetAmount && expense.budgetRecurrence && expense.isRecurring) {
      const currentPeriod = this.getCurrentExpenseBudgetPeriod(expense.budgetRecurrence);
      newExpense.budgetPeriod = currentPeriod;
      newExpense.budgetSpent = expense.amount; // Premier achat compte dans le budget
    }
    
    expenses.push(newExpense);
    await this.saveExpenses(expenses);
    
    // Update budget if associated
    if (expense.budgetId) {
      await budgetUtils.addSpentToBudget(expense.budgetId, expense.amount);
    }
  },

  async incrementExpense(expenseId: string): Promise<void> {
    const expenses = await this.getExpenses();
    const expenseIndex = expenses.findIndex(e => e.id === expenseId);
    
    if (expenseIndex !== -1) {
      let expense = expenses[expenseIndex];
      const today = new Date().toISOString();
      
      // Vérifier et rafraîchir la période du budget individuel
      expense = this.checkAndRefreshExpenseBudgetPeriod(expense);
      
      // Mettre à jour les compteurs
      expense.count += 1;
      expense.totalAmount += expense.amount;
      expense.lastPurchaseAt = today;
      expense.purchaseDates.push(today);
      
      // Mettre à jour le budget individuel si présent
      if (expense.budgetAmount && expense.budgetRecurrence) {
        expense.budgetSpent = (expense.budgetSpent || 0) + expense.amount;
      }
      
      expenses[expenseIndex] = expense;
      await this.saveExpenses(expenses);
      
      // Update budget if associated
      if (expense.budgetId) {
        await budgetUtils.addSpentToBudget(expense.budgetId, expense.amount);
      }
    }
  },

  async deleteExpense(expenseId: string): Promise<void> {
    const expenses = await this.getExpenses();
    const filteredExpenses = expenses.filter(e => e.id !== expenseId);
    await this.saveExpenses(filteredExpenses);
  },

  async archiveExpense(expenseId: string): Promise<void> {
    const expenses = await this.getExpenses();
    const expenseIndex = expenses.findIndex(e => e.id === expenseId);
    
    if (expenseIndex !== -1) {
      expenses[expenseIndex].isArchived = true;
      await this.saveExpenses(expenses);
    }
  },

  async refreshExpenseBudgetPeriods(): Promise<void> {
    const expenses = await this.getExpenses();
    let hasChanges = false;

    for (let i = 0; i < expenses.length; i++) {
      if (expenses[i].budgetRecurrence && expenses[i].budgetAmount) {
        const refreshedExpense = this.checkAndRefreshExpenseBudgetPeriod(expenses[i]);
        if (refreshedExpense.budgetPeriod !== expenses[i].budgetPeriod) {
          expenses[i] = refreshedExpense;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      await this.saveExpenses(expenses);
    }
  },

  async getActiveExpenses(): Promise<Expense[]> {
    // Rafraîchir les périodes des budgets individuels d'abord
    await this.refreshExpenseBudgetPeriods();
    const expenses = await this.getExpenses();
    return expenses.filter(e => !e.isArchived);
  }
};